/**
 * Optional Cloudflare Worker relay (RELAY_URL).
 * When set, GET requests to the allowlisted public hosts are fetched as
 * `${RELAY_URL}/?u=<urlencoded target>` instead of directly from the server IP.
 * Session Cookie headers and non-GET bodies are never sent through the relay
 * (the Worker does not forward them).
 */
export const RELAY_HOSTS = new Set(["www.tikwm.com", "tikwm.com", "www.tiktok.com", "countik.com"]);

export function readRelayUrl(raw?: string): string {
  return (raw ?? process.env.RELAY_URL ?? "").trim().replace(/\/+$/, "");
}

export function validateRelayUrl(v: string): string | null {
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "رابط الـ Worker لازم يبدأ بـ https://";
    if (!u.hostname) return "رابط الـ Worker غير صالح";
    return null;
  } catch {
    return "رابط الـ Worker غير صالح";
  }
}

export function isRelayHost(url: string): boolean {
  try {
    return RELAY_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function rewriteViaRelay(target: string, base = readRelayUrl()): string {
  return `${base}/?u=${encodeURIComponent(target)}`;
}

export function shouldRelay(
  url: string,
  opts: { method?: string; body?: string; headers?: Record<string, string> } = {},
): boolean {
  if (!readRelayUrl()) return false;
  const method = (opts.method ?? "GET").toUpperCase();
  if (method !== "GET" || opts.body) return false;
  const headers = opts.headers ?? {};
  if (Object.entries(headers).some(([k, v]) => k.toLowerCase() === "cookie" && !!v)) return false;
  return isRelayHost(url);
}

export interface RelayTry {
  at: string;
  host: string;
  status?: number;
  ok?: boolean;
}

let lastTry: RelayTry | null = null;
export const relayTry = () => lastTry;

export function recordRelayTry(target: string, status?: number, ok?: boolean) {
  let host = "unknown";
  try {
    host = new URL(target).hostname;
  } catch {
    /* ignore */
  }
  lastTry = { at: new Date().toISOString(), host, status, ok };
}
