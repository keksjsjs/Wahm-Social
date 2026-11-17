/** Admin-managed ordered lists (failover order = list order). Stored encrypted in secrets as `pool_<kind>`. */
export type PoolKind = "proxies" | "relays" | "tiktok" | "instagram";

export const POOL_KINDS: PoolKind[] = ["proxies", "relays", "tiktok", "instagram"];

export interface IgCookies {
  sessionid: string;
  csrftoken?: string;
  dsUserId?: string;
  mid?: string;
  datr?: string;
}

export interface PoolEntry {
  id: string;
  label: string;
  enabled: boolean;
  /** proxies / relays */
  url?: string;
  /** tiktok: full Cookie header (or "sessionid=…") */
  cookie?: string;
  /** instagram session cookies */
  ig?: IgCookies;
  addedAt?: string;
}

export const POOL_TITLE: Record<PoolKind, string> = {
  proxies: "البروكسيات",
  relays: "مسارات Cloudflare Worker",
  tiktok: "جلسات تيك توك",
  instagram: "جلسات انستقرام",
};

export const poolSecretKey = (k: PoolKind) => `pool_${k}`;
