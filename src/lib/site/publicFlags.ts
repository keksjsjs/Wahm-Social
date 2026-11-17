import type { Platform } from "../platforms/types";
import type { SiteSettings } from "./types";

/** Non-secret switches the client needs (passed through I18nProvider). */
export interface PublicSite {
  platforms: Platform[];
  followers: boolean;
  following: boolean;
  analytics: boolean;
  stories: boolean;
  downloads: boolean;
  pro: boolean;
  prices: SiteSettings["features"]["prices"];
  footerCredit: string;
  heroImage: string;
}

export function publicSite(s: SiteSettings): PublicSite {
  const f = s.features;
  const platforms = (["tiktok", "instagram"] as Platform[]).filter((p) => f[p]);
  return {
    platforms: platforms.length ? platforms : ["tiktok"],
    followers: f.followers,
    following: f.following !== false,
    analytics: f.analytics !== false,
    stories: f.stories,
    downloads: f.downloads,
    pro: f.pro,
    prices: f.prices,
    footerCredit: s.texts.footerCredit,
    heroImage: s.assets.heroImage ? `/api/site-asset/${s.assets.heroImage}` : "/hero.webp",
  };
}

export const DEFAULT_PUBLIC_SITE: PublicSite = {
  platforms: ["tiktok", "instagram"],
  followers: true,
  following: true,
  analytics: true,
  stories: true,
  downloads: true,
  pro: true,
  prices: { proMonthly: 7.99, proYearly: 59.99, bizMonthly: 29.99, bizYearly: 249.99 },
  footerCredit: "Frostly · by Wahm (@iwahm)",
  heroImage: "/hero.webp",
};
