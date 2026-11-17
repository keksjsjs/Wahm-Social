/** Server-side feature gates from admin settings (sync, snapshot-based). */
import { PlatformError, type Platform } from "../platforms/types";
import { siteNow } from "./snapshot";

export type Feature = "followers" | "following" | "stories" | "downloads" | "region" | "posts" | "search" | "analytics" | "pro";

export const platformEnabled = (p: Platform) => Boolean(siteNow().features[p]);
export const featureOn = (f: Feature) => siteNow().features[f] !== false;

export const DISABLED_MSG: Record<Feature, string> = {
  followers: "عرض المتابعين متوقف مؤقتاً من الإدارة. Followers are temporarily disabled.",
  following: "عرض المتابَعين متوقف مؤقتاً من الإدارة. Following lists are temporarily disabled.",
  stories: "الستوري متوقف مؤقتاً من الإدارة. Stories are temporarily disabled.",
  downloads: "التحميل متوقف مؤقتاً من الإدارة. Downloads are temporarily disabled.",
  region: "عرض دولة الحساب متوقف مؤقتاً. Account country is temporarily disabled.",
  posts: "عرض المنشورات متوقف مؤقتاً من الإدارة. Posts are temporarily disabled.",
  search: "البحث متوقف مؤقتاً من الإدارة. Search is temporarily disabled.",
  analytics: "التحليلات متوقفة مؤقتاً من الإدارة. Analytics are temporarily disabled.",
  pro: "اشتراكات برو متوقفة مؤقتاً. Pro plans are temporarily unavailable.",
};

export function requireFeatureOn(f: Feature) {
  if (!featureOn(f)) throw new PlatformError("unauthorized", DISABLED_MSG[f], 403);
}

/** Admin-configurable numeric limits with sane clamps. */
export function limit(k: keyof ReturnType<typeof siteNow>["limits"], min: number, max: number): number {
  const v = Number(siteNow().limits?.[k]);
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min;
}

export function maintenanceOn(): boolean {
  return Boolean(siteNow().maintenance?.enabled);
}

export function requireNotMaintenance() {
  if (maintenanceOn()) {
    const m = siteNow().maintenance.message;
    throw new PlatformError("upstream_error", `${m.ar} ${m.en}`.trim(), 503);
  }
}
