/** Admin-editable site settings (non-secret part, stored as settings.json). */
export type Bi = { ar: string; en: string };

export interface BrandSettings {
  siteName: Bi;
  tagline: Bi;
}

export interface TextSettings {
  heroBadge: Bi;
  heroTitle1: Bi;
  heroTitle2: Bi;
  heroSubtitle: Bi;
  footerDisclaimer: Bi;
  footerRights: Bi;
  footerCredit: string;
  banner: Bi;
  bannerEnabled: boolean;
  bannerLink: string;
}

export interface SeoSettings {
  defaultTitle: string;
  titleTemplate: string;
  homeTitle: string;
  description: string;
  keywords: string[];
  googleVerification: string;
  bingVerification: string;
  robotsIndex: boolean;
  twitterHandle: string;
}

export interface FeatureSettings {
  tiktok: boolean;
  instagram: boolean;
  followers: boolean;
  stories: boolean;
  downloads: boolean;
  pro: boolean;
  demoMode: "" | "auto" | "on" | "off";
  prices: { proMonthly: number; proYearly: number; bizMonthly: number; bizYearly: number };
}

export interface ThemeSettings {
  accentPrimary: string;
  accentSecondary: string;
  defaultTheme: "system" | "light" | "dark";
}

/** Uploaded images stored next to settings.json (assets/<file>). */
export interface AssetSettings {
  favicon: string;
  ogImage: string;
  heroImage: string;
}

export interface SiteSettings {
  version: number;
  updatedAt: string;
  /** Cloudflare Worker base URL (RELAY_URL). Empty = use the Render env value. */
  relayUrl: string;
  brand: BrandSettings;
  texts: TextSettings;
  seo: SeoSettings;
  features: FeatureSettings;
  theme: ThemeSettings;
  assets: AssetSettings;
}

export type SettingsSection = "brand" | "texts" | "seo" | "features" | "theme" | "assets" | "relay";
