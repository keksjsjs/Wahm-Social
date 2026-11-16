import "server-only";
/**
 * Account country without needing posts.
 * 1. user.region from the (anonymous) SSR profile — present for many accounts, including new ones
 * 2. Logged-in SSR of the same page
 * 3. Session-authenticated /api/user/detail/
 * 4. Per-video locationCreated — last resort when region is absent (and the account has posts)
 * Region lookups and video sampling run in parallel so we never lose the video fallback to timeouts.
 */
import type { Profile, ProfileLocation } from "../types";
import { httpGet } from "../../server/http";
import { cookieValue, hasTikTokSession, tiktokWebHeaders } from "./session";
import { accountLocation } from "./location";
import { rememberedRegion } from "./followers/web";

function asCountry(v: unknown): string | undefined {
  return typeof v === "string" && /^[A-Za-z]{2}$/.test(v) ? v.toUpperCase() : undefined;
}

let lastRegionTry: { at: string; step: string; found: boolean; keys?: string[] } | null = null;
export const regionTry = () => lastRegionTry;

async function pageRegion(username: string): Promise<string | undefined> {
  if (!hasTikTokSession()) return undefined;
  try {
    const res = await httpGet(`https://www.tiktok.com/@${encodeURIComponent(username)}?lang=en`, {
      headers: { ...tiktokWebHeaders(`https://www.tiktok.com/@${username}`), accept: "text/html" },
      retries: 0,
      timeoutMs: 10000,
    });
    const m = res.text.match(/id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) {
      lastRegionTry = { at: new Date().toISOString(), step: "page_ssr", found: false, keys: [`http_${res.status}`, `len_${res.text.length}`] };
      return undefined;
    }
    const u = JSON.parse(m[1])?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.user ?? {};
    const found = asCountry(u?.region);
    lastRegionTry = {
      at: new Date().toISOString(),
      step: "page_ssr",
      found: !!found,
      keys: Object.keys(u).filter((k) => /region|country|location|lang|commerce/i.test(k) || k === "uniqueId"),
    };
    return found;
  } catch (e) {
    lastRegionTry = { at: new Date().toISOString(), step: "page_ssr", found: false, keys: [(e as Error).message?.slice(0, 40) ?? "err"] };
    return undefined;
  }
}

async function detailRegion(username: string, secUid?: string): Promise<string | undefined> {
  if (!hasTikTokSession()) return undefined;
  const ms = cookieValue("msToken");
  const qs = new URLSearchParams({
    aid: "1988",
    app_name: "tiktok_web",
    device_platform: "web_pc",
    uniqueId: username,
    secUid: secUid ?? "",
  });
  if (ms) qs.set("msToken", ms);
  try {
    const res = await httpGet(`https://www.tiktok.com/api/user/detail/?${qs}`, {
      headers: tiktokWebHeaders(`https://www.tiktok.com/@${username}`),
      retries: 0,
      timeoutMs: 8000,
    });
    if (!res.text.trimStart().startsWith("{")) {
      // Keep earlier page_ssr diagnostic if it found keys; otherwise record this miss.
      if (!lastRegionTry?.found) lastRegionTry = { at: new Date().toISOString(), step: "user_detail", found: false, keys: [`http_${res.status}`, `len_${res.text.length}`] };
      return undefined;
    }
    const j = JSON.parse(res.text);
    const u = j?.userInfo?.user ?? j?.user ?? {};
    const found = asCountry(u?.region);
    lastRegionTry = {
      at: new Date().toISOString(),
      step: "user_detail",
      found: !!found,
      keys: Object.keys(u).filter((k) => /region|country|location|lang|commerce/i.test(k) || k === "uniqueId"),
    };
    return found;
  } catch {
    return undefined;
  }
}

export async function resolveLocation(profile: Profile): Promise<ProfileLocation | undefined> {
  // Run region enrichment and video sampling together so video country isn't lost to timeouts.
  const videoPromise = profile.isPrivate
    ? Promise.resolve(undefined)
    : Promise.race([
        accountLocation(profile.username, profile.language).catch(() => undefined),
        new Promise<undefined>((r) => setTimeout(() => r(undefined), 10000)),
      ]);

  const regionPromise = (async () => {
    let region = profile.region ?? rememberedRegion(profile.username);
    if (region) {
      lastRegionTry = { at: new Date().toISOString(), step: profile.region ? "ssr_field" : "list_hint", found: true, keys: ["region"] };
      return region;
    }
    if (!region) region = await pageRegion(profile.username).catch(() => undefined);
    if (!region) region = await detailRegion(profile.username, profile.secUid).catch(() => undefined);
    return region;
  })();

  let [region, fromVideos] = await Promise.all([regionPromise, videoPromise]);
  let regionSource: "profile" | "video" | undefined = region ? "profile" : undefined;

  // Last resort: country from a real video via countik id + tikwm region.
  // Never invent a country for accounts with zero posts.
  if (!region && !fromVideos?.current && (profile.postsCount ?? 0) > 0) {
    region = await fallbackVideoRegion(profile).catch(() => undefined);
    if (region) regionSource = "video";
  }

  if (region) {
    return {
      current: region,
      source: regionSource ?? "profile",
      place: fromVideos?.place,
      recent: fromVideos?.recent?.filter((x) => x.code !== region) ?? [],
      sample: fromVideos?.sample ?? 0,
      language: profile.language ?? fromVideos?.language,
    };
  }
  if (fromVideos?.current || fromVideos?.place || fromVideos?.language) {
    return { ...fromVideos, source: fromVideos.current ? "video" : undefined };
  }
  if (profile.language) return { recent: [], sample: 0, language: profile.language };
  return undefined;
}

async function fallbackVideoRegion(profile: Profile): Promise<string | undefined> {
  if (!profile.secUid && !profile.username) return undefined;
  const { countikVideoIds } = await import("./countik");
  const { tikwmVideo } = await import("./tikwm");
  const ids = profile.secUid ? await countikVideoIds(profile.secUid).catch(() => [] as string[]) : [];
  const id = ids[0];
  if (!id) return undefined;
  const vid = await Promise.race([
    tikwmVideo(`https://www.tiktok.com/@${profile.username}/video/${id}`),
    new Promise<null>((r) => setTimeout(() => r(null), 8000)),
  ]).catch(() => null);
  if (!vid || !vid.ok) return undefined;
  const found = asCountry(vid.data.region);
  lastRegionTry = {
    at: new Date().toISOString(),
    step: "tikwm_video",
    found: !!found,
    keys: found ? ["region"] : ["no_region"],
  };
  return found;
}
