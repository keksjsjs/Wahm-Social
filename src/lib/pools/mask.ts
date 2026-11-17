/** Display-safe descriptions of pool entries — never return passwords, cookies or session ids. */
import type { PoolEntry, PoolKind } from "./types";

const dots = "••••";

export function maskUser(u: string): string {
  if (!u) return "";
  const d = decodeURIComponent(u);
  return d.length <= 3 ? `${d[0] ?? ""}${dots}` : `${d.slice(0, 3)}${dots}`;
}

/** http://user:pass@host:port → http://use••••:••••@host:port */
export function maskProxyUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const auth = u.username ? `${maskUser(u.username)}${u.password ? `:${dots}` : ""}@` : "";
    const port = u.port || (raw.match(/:(\d{1,5})\/?$/) ?? [])[1] || "";
    return `${u.protocol}//${auth}${u.hostname}${port ? `:${port}` : ""}`;
  } catch {
    return "رابط غير صالح";
  }
}

/** 191.96.254.138 → 191.96.x.x (hostnames unchanged). */
export function maskIp(ip: string): string {
  const m = ip.trim().match(/^(\d+)\.(\d+)\.\d+\.\d+$/);
  if (m) return `${m[1]}.${m[2]}.x.x`;
  if (ip.includes(":")) return ip.split(":").slice(0, 2).join(":") + ":…";
  return ip;
}

function cookieNames(cookie: string): string[] {
  return cookie
    .split(/;|\n/)
    .map((p) => p.trim().split(/\s*=\s*/)[0])
    .filter((n) => /^[A-Za-z0-9_.-]+$/.test(n));
}

export function describeEntry(kind: PoolKind, e: PoolEntry): string {
  if (kind === "proxies") return e.url ? maskProxyUrl(e.url) : "—";
  if (kind === "relays") return e.url ?? "—";
  if (kind === "tiktok") {
    const c = e.cookie ?? "";
    const names = new Set(cookieNames(c));
    const flags = ["sessionid", "msToken", "tt_csrf_token", "ttwid"].map((n) => `${n}${names.has(n) ? "✓" : "✗"}`);
    return `كوكيز ${names.size} قيمة (${c.length} حرف) · ${flags.join(" ")}`;
  }
  const ig = e.ig;
  if (!ig?.sessionid) return "—";
  const flags = (["csrftoken", "dsUserId", "mid", "datr"] as const).map((k) => `${k}${ig[k] ? "✓" : "✗"}`);
  return `sessionid ${dots} (${ig.sessionid.length} حرف) · ${flags.join(" ")}`;
}
