import "server-only";
/**
 * TikTok web session helpers. Cookie / session values are never logged or returned.
 */
import { env } from "../../env";

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export const hasTikTokSession = () => Boolean(env.tiktokCookie || env.tiktokSessionId);

const ATTR = /^(domain|path|expires|max-age|secure|httponly|samesite)$/i;

/**
 * Normalise TIKTOK_COOKIE into a single Cookie header.
 * Accepts a normal "a=b; c=d" header, or the Wahm export format
 * ("name = value" / "name=value" lines with attribute lines underneath).
 * Duplicate names keep the LAST value (important for msToken).
 */
export function tiktokCookieHeader(): string {
  const raw = (env.tiktokCookie || "").trim().replace(/^Cookie:\s*/i, "");
  if (raw) {
    const map = new Map<string, string>();
    if (raw.includes("\n")) {
      for (const ln of raw.split(/\r?\n/)) {
        const s = ln.trim();
        if (!s || s.startsWith("#") || ATTR.test(s.split(/[=\s]/)[0] || "")) continue;
        // "name = value" or "name=value" (ignore trailing "; attr=...")
        const m = s.match(/^([A-Za-z0-9_.-]+)\s*=\s*([^;]*)$/);
        if (m) {
          map.set(m[1], m[2].trim());
          continue;
        }
        // legacy "name value" (no equals)
        const sp = s.match(/^([A-Za-z0-9_.-]+)\s+(\S.*)$/);
        if (sp && !sp[2].startsWith("=")) map.set(sp[1], sp[2].trim());
      }
      if (map.size) return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    }
    // Flat header: last-wins for duplicate names (e.g. two msToken=)
    for (const part of raw.split(";")) {
      const p = part.trim();
      if (!p.includes("=")) continue;
      const i = p.indexOf("=");
      const name = p.slice(0, i).trim();
      const val = p.slice(i + 1).trim();
      if (!name || ATTR.test(name)) continue;
      map.set(name, val);
    }
    if (map.size) return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    return raw;
  }
  if (env.tiktokSessionId) return `sessionid=${env.tiktokSessionId}`;
  return "";
}

/** Raw cookie value (last duplicate wins). Never logs. */
export function cookieRaw(name: string): string {
  const all = [...tiktokCookieHeader().matchAll(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`, "g"))];
  return all.length ? all[all.length - 1][1] : "";
}

/**
 * Cookie value for use in query/headers.
 * Decodes at most once when the stored value looks percent-encoded —
 * avoids mangling raw msToken and avoids double-decoding.
 */
export function cookieValue(name: string): string {
  const raw = cookieRaw(name);
  if (!raw) return "";
  if (!/%[0-9A-Fa-f]{2}/.test(raw)) return raw;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function cookiesForBrowser(): { name: string; value: string; domain: string; path: string }[] {
  const map = new Map<string, string>();
  for (const p of tiktokCookieHeader().split(";")) {
    const s = p.trim();
    if (!s.includes("=")) continue;
    const i = s.indexOf("=");
    const name = s.slice(0, i).trim();
    let value = s.slice(i + 1).trim();
    if (!name || !value || name.includes("=")) continue;
    // Puppeteer wants the decoded cookie value; decode at most once.
    if (/%[0-9A-Fa-f]{2}/.test(value)) {
      try { value = decodeURIComponent(value); } catch { /* keep */ }
    }
    map.set(name, value);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value, domain: ".tiktok.com", path: "/" }));
}

export function tiktokWebHeaders(referer: string, cookieOverride?: string): Record<string, string> {
  const cookie = cookieOverride || tiktokCookieHeader();
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
    h["x-secsdk-csrf-token"] = csrf;
  }
  return h;
}

export { CHROME_UA };
