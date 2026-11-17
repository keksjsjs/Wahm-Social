/** Validation for pool entries added from the panel (messages in Arabic). */
export function validateProxy(v: string): string | null {
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "البروكسي لازم يبدأ بـ http:// أو https:// (SOCKS غير مدعوم حالياً)";
    // URL drops default ports (":80"), so read the port from the raw text.
    if (!u.hostname || !/:\d{1,5}\/?$/.test(v.replace(/\/+$/, "") + "")) return "اكتب الرابط كامل مع البورت: http://user:pass@host:port";
    return null;
  } catch {
    return "رابط البروكسي غير صالح";
  }
}

export function validateRelay(v: string): string | null {
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return "رابط الـ Worker لازم يبدأ بـ https://";
    if (!u.hostname) return "رابط الـ Worker غير صالح";
    return null;
  } catch {
    return "رابط الـ Worker غير صالح";
  }
}

/** Accept a `curl --proxy "http://…"` line as pasted from Webshare and pull out the URL. */
export function extractProxyUrl(raw: string): string {
  const s = raw.trim();
  const m = s.match(/(?:--proxy|-x)\s+["']?((?:https?):\/\/[^"'\s]+)["']?/i) || s.match(/((?:https?):\/\/[^\s"']+)/i);
  return (m ? m[1] : s).replace(/\/+$/, "");
}

/** host:port:user:pass (Webshare list export) → http://user:pass@host:port */
export function normalizeProxyLine(raw: string): string {
  const s = extractProxyUrl(raw);
  const parts = s.split(":");
  if (!/^https?:/i.test(s) && parts.length === 4 && /^\d+$/.test(parts[1])) {
    const [host, port, user, pass] = parts;
    return `http://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}`;
  }
  if (!/^https?:\/\//i.test(s) && /^[^\s/]+:\d+$/.test(s)) return `http://${s}`;
  return s;
}
