import "server-only";
/**
 * TikTok follower / following list via its own web endpoints.
 * Uses the full logged-in Cookie header (TIKTOK_COOKIE) when available —
 * including msToken (as a query param) and tt_csrf_token (as a header).
 * We never generate X-Bogus / _signature; if TikTok still answers with an empty
 * body, that is reported honestly as needing signing.
 */
import { cookiesFrom, DESKTOP_UA, httpGet, MOBILE_UA } from "../../../server/http";
import { cookieValue, hasTikTokSession, tiktokCookieHeader, tiktokWebHeaders } from "../session";
import type { Connection, ConnectionAttempt } from "../../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const SCENE = { followers: 67, following: 21 } as const;

async function anonCookies(username: string, ua: string): Promise<string> {
  try {
    const res = await httpGet(`https://www.tiktok.com/@${encodeURIComponent(username)}`, { headers: { "user-agent": ua }, retries: 0, timeoutMs: 8000 });
    return cookiesFrom(res.headers);
  } catch {
    return "";
  }
}

/** username → ISO country, learned from session list responses (those user objects often include region). */
const regionHints = new Map<string, string>();
export function rememberedRegion(username: string): string | undefined {
  return regionHints.get(username.toLowerCase());
}
export const regionHintCount = () => regionHints.size;
export const regionHintSample = () => [...regionHints.entries()].slice(0, 5).map(([u, r]) => ({ u, r }));

let lastUserKeys: string[] = [];
export const lastListUserKeys = () => lastUserKeys;

function parseUsers(j: any): Connection[] {
  const list: any[] = j?.userList ?? j?.followings ?? j?.followers ?? j?.userInfoList ?? [];
  const users = list.map((x) => x?.user ?? x).filter((u) => u?.uniqueId || u?.unique_id);
  if (users[0]) {
    lastUserKeys = Object.keys(users[0]).sort();
    // Also peek one level into nested objects for region-ish fields (key names only).
    for (const [k, v] of Object.entries(users[0])) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        for (const nk of Object.keys(v as object)) {
          if (/region|country|location|lang/i.test(nk)) lastUserKeys.push(`${k}.${nk}`);
        }
      }
    }
  }
  return users.map((u) => {
    const username = u.uniqueId || u.unique_id;
    const region =
      (typeof u.region === "string" && /^[A-Za-z]{2}$/.test(u.region) && u.region.toUpperCase()) ||
      (typeof u.country === "string" && /^[A-Za-z]{2}$/.test(u.country) && u.country.toUpperCase()) ||
      undefined;
    if (region) {
      regionHints.set(String(username).toLowerCase(), region);
      if (regionHints.size > 5000) regionHints.delete(regionHints.keys().next().value as string);
    }
    return {
      username,
      displayName: u.nickname || username,
      avatarUrl: u.avatarThumb || u.avatarMedium || u.avatar_thumb?.url_list?.[0] || "",
      verified: !!u.verified,
    };
  });
}

async function callList(
  url: string,
  headers: Record<string, string>,
  method: ConnectionAttempt["method"],
): Promise<{ items: Connection[]; attempt: ConnectionAttempt; status: number; bodyLen: number }> {
  try {
    const res = await httpGet(url, { headers, retries: 0, timeoutMs: 10000 });
    const body = res.text.trim();
    if (!body) return { items: [], attempt: { method, ok: false, note: "empty_unsigned" }, status: res.status, bodyLen: 0 };
    if (!body.startsWith("{")) return { items: [], attempt: { method, ok: false, note: `http_${res.status}` }, status: res.status, bodyLen: body.length };
    const j = JSON.parse(body);
    const items = parseUsers(j);
    const note = items.length ? "ok" : j?.statusCode !== undefined ? `status_${j.statusCode}` : j?.status_msg ? String(j.status_msg).slice(0, 40) : "empty_json";
    return { items, attempt: { method, ok: items.length > 0, note }, status: res.status, bodyLen: body.length };
  } catch (e) {
    return { items: [], attempt: { method, ok: false, note: (e as Error).message?.slice(0, 40) ?? "error" }, status: 0, bodyLen: 0 };
  }
}

function listUrls(host: string, secUid: string, kind: "followers" | "following", msToken: string, mobile: boolean): string[] {
  const base = new URLSearchParams({
    aid: "1988",
    app_language: "en",
    app_name: "tiktok_web",
    browser_language: "en-US",
    browser_name: "Mozilla",
    browser_online: "true",
    browser_platform: "Win32",
    browser_version: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    channel: "tiktok_web",
    cookie_enabled: "true",
    count: "30",
    device_id: cookieValue("ttwid") || cookieValue("s_v_web_id") || "",
    device_platform: mobile ? "web_mobile" : "web_pc",
    focus_state: "true",
    from_page: "user",
    history_len: "3",
    is_fullscreen: "false",
    is_page_visible: "true",
    maxCursor: "0",
    minCursor: "0",
    os: "windows",
    priority_region: cookieValue("store-country-code") || "",
    referer: "",
    region: (cookieValue("store-country-code") || "US").toUpperCase(),
    scene: String(SCENE[kind]),
    screen_height: "1080",
    screen_width: "1920",
    secUid,
    tz_name: "America/Toronto",
    webcast_language: "en",
  });
  if (msToken) base.set("msToken", msToken);
  // Drop empty values so TikTok doesn't reject on blank device_id.
  [...base.keys()].forEach((k) => { if (!base.get(k)) base.delete(k); });
  const q = base.toString();
  return [
    `https://${host}/api/user/list/?${q}`,
    `https://${host}/api/commit/follow/list/?${q}&type=${kind === "followers" ? "1" : "2"}`,
  ];
}

/** Last session attempt detail (status / body length only — never cookies), for /api/health?ig=1. */
let lastSessionTry: { at: string; status: number; bodyLen: number; note: string; urlHost: string } | null = null;
export const lastFollowerTry = () => lastSessionTry;

export async function webList(
  username: string,
  secUid: string,
  kind: "followers" | "following",
  method: ConnectionAttempt["method"],
): Promise<{ items: Connection[]; attempt: ConnectionAttempt }> {
  const mobile = method === "mobile_web";
  const referer = `https://www.tiktok.com/@${username}`;

  if (method === "session") {
    if (!hasTikTokSession()) return { items: [], attempt: { method, ok: false, note: "not_configured" } };
    const msToken = cookieValue("msToken");
    const headers = tiktokWebHeaders(referer);
    for (const host of ["www.tiktok.com", "m.tiktok.com"]) {
      for (const url of listUrls(host, secUid, kind, msToken, host.startsWith("m."))) {
        const r = await callList(url, headers, method);
        lastSessionTry = { at: new Date().toISOString(), status: r.status, bodyLen: r.bodyLen, note: r.attempt.note, urlHost: host };
        // Log only the classification — never the cookie or URL query (msToken lives there).
        console.warn(`[tiktok-followers] session ${host} status=${r.status} body=${r.bodyLen} note=${r.attempt.note}`);
        if (r.items.length) return { items: r.items, attempt: r.attempt };
        // Empty body = signing wall; keep trying other hosts/paths once, then stop.
        if (r.attempt.note === "empty_unsigned") continue;
      }
    }
    return { items: [], attempt: { method, ok: false, note: lastSessionTry?.note ?? "empty_unsigned" } };
  }

  // Anonymous / mobile-web paths (no signed-in cookie).
  const ua = mobile ? MOBILE_UA : DESKTOP_UA;
  const host = mobile ? "m.tiktok.com" : "www.tiktok.com";
  const cookie = await anonCookies(username, ua);
  const qs = new URLSearchParams({
    aid: "1988",
    app_language: "en",
    app_name: "tiktok_web",
    device_platform: mobile ? "web_mobile" : "web_pc",
    count: "30",
    maxCursor: "0",
    minCursor: "0",
    scene: String(SCENE[kind]),
    secUid,
  });
  const r = await callList(`https://${host}/api/user/list/?${qs}`, {
    "user-agent": ua,
    referer,
    accept: "application/json",
    ...(cookie ? { cookie } : {}),
  }, method);
  return { items: r.items, attempt: r.attempt };
}

/** Expose whether a full Cookie header is configured (boolean only). */
export const sessionConfigured = () => ({ cookie: Boolean(tiktokCookieHeader()), hasMsToken: Boolean(cookieValue("msToken")), hasCsrf: Boolean(cookieValue("tt_csrf_token")) });
