/** Build new pool entries from panel form input (validated). */
import { newId } from "./ops";
import { normalizeProxyLine, validateProxy, validateRelay } from "./validate";
import type { IgCookies, PoolEntry, PoolKind } from "./types";

const str = (f: FormData, k: string, max = 20_000) => String(f.get(k) ?? "").slice(0, max).trim();

function igFromCookieHeader(raw: string): Partial<IgCookies> {
  const map = new Map<string, string>();
  for (const part of raw.replace(/^Cookie:\s*/i, "").split(/;|\n/)) {
    const i = part.indexOf("=");
    if (i > 0) map.set(part.slice(0, i).trim(), part.slice(i + 1).trim());
  }
  return { sessionid: map.get("sessionid"), csrftoken: map.get("csrftoken"), dsUserId: map.get("ds_user_id"), mid: map.get("mid"), datr: map.get("datr") };
}

export function buildEntries(kind: PoolKind, f: FormData): PoolEntry[] {
  const label = str(f, "label", 60);
  const base = (i: number, n: number): Pick<PoolEntry, "id" | "label" | "enabled" | "addedAt"> => ({
    id: newId(),
    label: label ? (n > 1 ? `${label} ${i + 1}` : label) : "",
    enabled: true,
    addedAt: new Date().toISOString(),
  });
  if (kind === "proxies" || kind === "relays") {
    const lines = str(f, "url").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    if (!lines.length) throw new Error("الصق الرابط أولاً");
    return lines.map((line, i) => {
      const url = kind === "proxies" ? normalizeProxyLine(line) : line.replace(/\/+$/, "");
      const bad = kind === "proxies" ? validateProxy(url) : validateRelay(url);
      if (bad) throw new Error(lines.length > 1 ? `سطر ${i + 1}: ${bad}` : bad);
      return { ...base(i, lines.length), url };
    });
  }
  if (kind === "tiktok") {
    const cookie = str(f, "cookie").replace(/^Cookie:\s*/i, "").replace(/\r/g, "");
    if (!cookie.includes("=") && !/^[A-Za-z0-9]{16,}$/.test(cookie)) throw new Error("الصق سطر الكوكيز كامل (فيه sessionid=…)");
    return [{ ...base(0, 1), cookie: cookie.includes("=") ? cookie : `sessionid=${cookie}` }];
  }
  const fromHeader = igFromCookieHeader(str(f, "cookie"));
  const ig: IgCookies = {
    sessionid: str(f, "sessionid", 600) || fromHeader.sessionid || "",
    csrftoken: str(f, "csrftoken", 200) || fromHeader.csrftoken || undefined,
    dsUserId: str(f, "dsUserId", 40) || fromHeader.dsUserId || undefined,
    mid: str(f, "mid", 200) || fromHeader.mid || undefined,
    datr: str(f, "datr", 200) || fromHeader.datr || undefined,
  };
  if (!ig.sessionid) throw new Error("sessionid مطلوب (أو الصق سطر الكوكيز كامل)");
  return [{ ...base(0, 1), ig }];
}
