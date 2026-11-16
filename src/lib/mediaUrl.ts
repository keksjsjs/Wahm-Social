/** Route an external image through our allow-listed proxy (safe for client & server). */
export function proxied(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("data:")) return url;
  return `/api/img?u=${encodeURIComponent(url)}`;
}

export function downloadHref(platform: string, ref: string, author?: string, index = 0, kind?: "audio") {
  const q = new URLSearchParams({ platform, ref, i: String(index) });
  if (author) q.set("u", author);
  if (kind) q.set("kind", kind);
  return `/api/download?${q.toString()}`;
}

export function profileHref(platform: string, username: string, tab?: string) {
  return `/${platform}/${username}${tab ? `/${tab}` : ""}`;
}

export function postHref(platform: string, username: string, ref: string) {
  return `/${platform}/${username}/post/${encodeURIComponent(ref)}`;
}

export function streamHref(platform: string, ref: string, author?: string, index = 0) {
  const q = new URLSearchParams({ platform, ref, i: String(index) });
  if (author) q.set("u", author);
  return `/api/stream?${q.toString()}`;
}
