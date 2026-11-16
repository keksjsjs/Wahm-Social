import "server-only";
/**
 * Account country without needing posts.
 * 1. user.region from the SSR profile (works for many accounts, including new ones)
 * 2. Logged-in SSR of the same page (region is sometimes only present when signed in)
 * 3. Session-authenticated /api/user/detail/
 * 4. Per-video locationCreated (last resort when region is absent)
 */
import type { Profile, ProfileLocation } from "../types";
import { httpGet } from "../../server/http";
import { cookieValue, hasTikTokSession, tiktokWebHeaders } from "./session";
import { accountLocation } from "./location";

let lastRegionTry: { at: string; step: string; found: boolean; keys?: string[] } | null = null;
export const regionTry = () => lastRegionTry;

function asCountry(v: unknown): string | undefined {
  return typeof v === "string" && /^[A-Za-z]{2}$/.test(v) ? v.toUpperCase() : undefined;
}

async function pageRegion(username: string): Promise<string | undefined> {
  if (!hasTikTokSession()) return undefined;
  try {
    const res = await httpGet(`https://www.tiktok.com/@${encodeURIComponent(username)}?lang=en`, {
      headers: { ...tiktokWebHeaders(`https://www.tiktok.com/@${username}`), accept: "text/html" },
      retries: 0,
      timeoutMs: 10000,
    });
    const m = res.text.match(/id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) return undefined;
    const u = JSON.parse(m[1])?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.user;
    return asCountry(u?.region);
  } catch {
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
      lastRegionTry = { at: new Date().toISOString(), step: "user_detail", found: false, keys: [`http_${res.status}`, `len_${res.text.length}`] };
      return undefined;
    }
    const j = JSON.parse(res.text);
    const u = j?.userInfo?.user ?? j?.user ?? {};
    const keys = Object.keys(u).filter((k) => /region|country|location|lang|commerce/i.test(k) || ["uniqueId","nickname","region","language"].includes(k));
    const found = asCountry(u?.region);
    lastRegionTry = { at: new Date().toISOString(), step: "user_detail", found: !!found, keys };
    return found;
  } catch (e) {
    lastRegionTry = { at: new Date().toISOString(), step: "user_detail", found: false, keys: [(e as Error).message?.slice(0, 40) ?? "err"] };
    return undefined;
  }
}

export async function resolveLocation(profile: Profile): Promise<ProfileLocation | undefined> {
  let region = profile.region;
  if (!region) region = await pageRegion(profile.username).catch(() => undefined);
  if (!region) region = await detailRegion(profile.username, profile.secUid).catch(() => undefined);

  let fromVideos: ProfileLocation | undefined;
  if (!profile.isPrivate) {
    fromVideos = await Promise.race([
      accountLocation(profile.username, profile.language).catch(() => undefined),
      new Promise<undefined>((r) => setTimeout(() => r(undefined), 9000)),
    ]);
  }

  if (region) {
    return {
      current: region,
      source: "profile",
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
