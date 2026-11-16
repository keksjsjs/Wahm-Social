/** Server-side feature gates from admin settings (sync, snapshot-based). */
import { PlatformError, type Platform } from "../platforms/types";
import { siteNow } from "./snapshot";

export const platformEnabled = (p: Platform) => Boolean(siteNow().features[p]);
export const featureOn = (f: "followers" | "stories" | "downloads" | "pro") => Boolean(siteNow().features[f]);

export const DISABLED_MSG: Record<"followers" | "stories" | "downloads" | "pro", string> = {
  followers: "عرض المتابعين متوقف مؤقتاً من الإدارة. Followers are temporarily disabled.",
  stories: "الستوري متوقف مؤقتاً من الإدارة. Stories are temporarily disabled.",
  downloads: "التحميل متوقف مؤقتاً من الإدارة. Downloads are temporarily disabled.",
  pro: "اشتراكات برو متوقفة مؤقتاً. Pro plans are temporarily unavailable.",
};

export function requireFeatureOn(f: "followers" | "stories" | "downloads" | "pro") {
  if (!featureOn(f)) throw new PlatformError("unauthorized", DISABLED_MSG[f], 403);
}
