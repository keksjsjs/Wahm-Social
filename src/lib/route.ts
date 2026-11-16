import type { Platform } from "./platforms/types";

/** Detects pasted URLs (→ post page / download) vs usernames (→ profile). */
export function routeForQuery(q: string, platform: Platform): string | null {
  const s = q.trim();
  if (!s) return null;
  const tt = s.match(/tiktok\.com\/@([A-Za-z0-9._]+)\/(?:video|photo)\/(\d+)/i);
  if (tt) return `/tiktok/${tt[1].toLowerCase()}/post/${tt[2]}`;
  const ttProfile = s.match(/tiktok\.com\/@([A-Za-z0-9._]+)/i);
  if (ttProfile) return `/tiktok/${ttProfile[1].toLowerCase()}`;
  if (/(vm|vt)\.tiktok\.com|tiktok\.com\/t\//i.test(s)) return `/download?url=${encodeURIComponent(s)}`;
  const igPost = s.match(/instagram\.com\/(?:[A-Za-z0-9._]+\/)?(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  if (igPost) return `/download?url=${encodeURIComponent(s)}`;
  const igProfile = s.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  if (igProfile) return `/instagram/${igProfile[1].toLowerCase()}`;
  const u = s.replace(/^@/, "").toLowerCase();
  if (!/^[a-z0-9._]{1,30}$/.test(u)) return null;
  return `/${platform}/${u}`;
}

