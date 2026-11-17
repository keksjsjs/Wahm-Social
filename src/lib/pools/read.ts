/** Read pools from the secrets bag; when a pool was never saved, seed it from the current env values. */
import type { PoolEntry, PoolKind } from "./types";
import { poolSecretKey } from "./types";

const splitList = (raw: string) => raw.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean);

function sanitize(kind: PoolKind, x: unknown, i: number): PoolEntry | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const e: PoolEntry = {
    id: typeof o.id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(o.id) ? o.id : `e${i}`,
    label: typeof o.label === "string" ? o.label.slice(0, 60) : "",
    enabled: o.enabled !== false,
    addedAt: typeof o.addedAt === "string" ? o.addedAt : undefined,
  };
  if (kind === "proxies" || kind === "relays") {
    if (typeof o.url !== "string" || !o.url) return null;
    e.url = o.url;
  } else if (kind === "tiktok") {
    if (typeof o.cookie !== "string" || !o.cookie) return null;
    e.cookie = o.cookie;
  } else {
    const ig = o.ig as Record<string, unknown> | undefined;
    if (!ig || typeof ig.sessionid !== "string" || !ig.sessionid) return null;
    const s = (k: string) => (typeof ig[k] === "string" && ig[k] ? (ig[k] as string) : undefined);
    e.ig = { sessionid: ig.sessionid, csrftoken: s("csrftoken"), dsUserId: s("dsUserId"), mid: s("mid"), datr: s("datr") };
  }
  return e;
}

/** Stored pool, or null when it was never saved from the panel. */
export function storedPool(secrets: Record<string, string>, kind: PoolKind): PoolEntry[] | null {
  const raw = secrets[poolSecretKey(kind)];
  if (!raw) return null;
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return null;
    return arr.map((x, i) => sanitize(kind, x, i)).filter((x): x is PoolEntry => !!x);
  } catch {
    return null;
  }
}

/** Entries implied by the env values currently in effect (Render or legacy single fields). */
export function seedFromEnv(kind: PoolKind, env: NodeJS.ProcessEnv = process.env): PoolEntry[] {
  if (kind === "proxies") return splitList(env.SCRAPER_PROXY ?? "").map((url, i) => ({ id: `env${i}`, label: `من Render #${i + 1}`, enabled: true, url }));
  if (kind === "relays") return splitList(env.RELAY_URL ?? "").map((url, i) => ({ id: `env${i}`, label: `من Render #${i + 1}`, enabled: true, url }));
  if (kind === "tiktok") {
    const cookie = env.TIKTOK_COOKIE || (env.TIKTOK_SESSIONID ? `sessionid=${env.TIKTOK_SESSIONID}` : "");
    return cookie ? [{ id: "env0", label: "الجلسة الحالية", enabled: true, cookie }] : [];
  }
  if (!env.IG_SESSIONID) return [];
  return [
    {
      id: "env0",
      label: "الجلسة الحالية",
      enabled: true,
      ig: { sessionid: env.IG_SESSIONID, csrftoken: env.IG_CSRFTOKEN || undefined, dsUserId: env.IG_DS_USER_ID || undefined, mid: env.IG_MID || undefined, datr: env.IG_DATR || undefined },
    },
  ];
}

export const enabledEntries = (list: PoolEntry[] | null) => (list ?? []).filter((e) => e.enabled);
