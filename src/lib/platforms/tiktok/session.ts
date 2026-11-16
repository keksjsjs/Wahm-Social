import "server-only";
/**
 * TikTok web session helpers. Cookie / session values are never logged or returned.
 */
import { env } from "../../env";

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export const hasTikTokSession = () => Boolean(env.tiktokCookie || env.tiktokSessionId);

/** Full Cookie header for TikTok web API calls. Prefer TIKTOK_COOKIE; fall back to sessionid alone. */
export function tiktokCookieHeader(): string {
  if (env.tiktokCookie) return env.tiktokCookie.trim().replace(/^Cookie:\s*/i, "");
  if (env.tiktokSessionId) return `sessionid=${env.tiktokSessionId}`;
  return "";
}

export function cookieValue(name: string): string {
  const m = tiktokCookieHeader().match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

export function tiktokWebHeaders(referer: string): Record<string, string> {
  const cookie = tiktokCookieHeader();
  const csrf = cookieValue("tt_csrf_token") || cookieValue("tt_chain_token");
  const h: Record<string, string> = {
    "user-agent": CHROME_UA,
    accept: "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    referer,
    origin: "https://www.tiktok.com",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
  };
  if (cookie) h.cookie = cookie;
  if (csrf) {
    h["tt-csrf-token"] = csrf;
    h["x-tt-csrf-token"] = csrf;
  }
  return h;
}

export { CHROME_UA };
