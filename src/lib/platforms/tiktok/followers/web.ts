import "server-only";
/**
 * TikTok's own follower/following list endpoint, called exactly as a plain
 * browser request (profile-page cookies + optional TIKTOK_SESSIONID).
 * We do NOT generate X-Bogus / msToken signatures; TikTok currently answers such
 * unsigned calls with an empty body, which we report honestly. If TikTok ever
 * serves data to plain requests, it is shown immediately.
 */
import { env } from "../../../env";
import { cookiesFrom, DESKTOP_UA, httpGet, MOBILE_UA } from "../../../server/http";
import type { Connection, ConnectionAttempt } from "../../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const SCENE = { followers: 67, following: 21 } as const;

async function profileCookies(username: string, ua: string): Promise<string> {
  try {
    const res = await httpGet(`https://www.tiktok.com/@${encodeURIComponent(username)}`, { headers: { "user-agent": ua }, retries: 0, timeoutMs: 8000 });
    return cookiesFrom(res.headers);
  } catch {
    return "";
  }
}

export async function webList(
  username: string,
  secUid: string,
  kind: "followers" | "following",
  method: ConnectionAttempt["method"],
): Promise<{ items: Connection[]; attempt: ConnectionAttempt }> {
  const mobile = method === "mobile_web";
  const ua = mobile ? MOBILE_UA : DESKTOP_UA;
  const host = mobile ? "m.tiktok.com" : "www.tiktok.com";
  let cookie = await profileCookies(username, ua);
  if (method === "session") {
    if (!env.tiktokSessionId) return { items: [], attempt: { method, ok: false, note: "not_configured" } };
    cookie = [cookie, `sessionid=${env.tiktokSessionId}`].filter(Boolean).join("; ");
  }
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
  try {
    const res = await httpGet(`https://${host}/api/user/list/?${qs}`, {
      headers: { "user-agent": ua, referer: `https://www.tiktok.com/@${username}`, accept: "application/json", ...(cookie ? { cookie } : {}) },
      retries: 0,
      timeoutMs: 8000,
    });
    if (!res.text.trim()) return { items: [], attempt: { method, ok: false, note: "empty_unsigned" } };
    if (!res.text.trimStart().startsWith("{")) return { items: [], attempt: { method, ok: false, note: `http_${res.status}` } };
    const j = JSON.parse(res.text);
    const list: any[] = j?.userList ?? [];
    const items = list
      .map((x) => x?.user ?? x)
      .filter((u) => u?.uniqueId)
      .map((u) => ({ username: u.uniqueId, displayName: u.nickname || u.uniqueId, avatarUrl: u.avatarThumb || u.avatarMedium || "", verified: !!u.verified }));
    return { items, attempt: { method, ok: items.length > 0, note: items.length ? "ok" : `status_${j?.statusCode ?? "empty"}` } };
  } catch (e) {
    return { items: [], attempt: { method, ok: false, note: (e as Error).message?.slice(0, 40) ?? "error" } };
  }
}
