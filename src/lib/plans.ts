/** Plan catalogue and feature gates — the single source of truth for Pro gating. */
import { priceOverrides } from "./site/prices";

const price = (k: "proMonthly" | "proYearly" | "bizMonthly" | "bizYearly", fallback: number) => {
  const v = priceOverrides()?.[k];
  return typeof v === "number" && v > 0 ? v : fallback;
};

export type PlanId = "free" | "pro" | "business";

export type Feature =
  | "batch_download"
  | "watchlist"
  | "compare"
  | "advanced_analytics"
  | "export_csv"
  | "hd_download"
  | "api_access"
  | "no_ads"
  | "story_archive";

export interface Plan {
  id: PlanId;
  name: { ar: string; en: string };
  priceMonthly: number; // USD
  priceYearly: number;
  dailyLookups: number;
  dailyDownloads: number;
  watchlistSize: number;
  compareSlots: number;
  batchSize: number;
  features: Feature[];
  highlight?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: { ar: "مجاني", en: "Free" },
    priceMonthly: 0,
    priceYearly: 0,
    dailyLookups: 30,
    dailyDownloads: 15,
    watchlistSize: 0,
    compareSlots: 0,
    batchSize: 0,
    features: [],
  },
  pro: {
    id: "pro",
    name: { ar: "برو", en: "Pro" },
    get priceMonthly() {
      return price("proMonthly", 7.99);
    },
    get priceYearly() {
      return price("proYearly", 59.99);
    },
    dailyLookups: 1000,
    dailyDownloads: 500,
    watchlistSize: 50,
    compareSlots: 4,
    batchSize: 30,
    features: ["batch_download", "watchlist", "compare", "advanced_analytics", "export_csv", "hd_download", "no_ads", "story_archive"],
    highlight: true,
  },
  business: {
    id: "business",
    name: { ar: "أعمال", en: "Business" },
    get priceMonthly() {
      return price("bizMonthly", 29.99);
    },
    get priceYearly() {
      return price("bizYearly", 249.99);
    },
    dailyLookups: 20000,
    dailyDownloads: 5000,
    watchlistSize: 500,
    compareSlots: 8,
    batchSize: 100,
    features: ["batch_download", "watchlist", "compare", "advanced_analytics", "export_csv", "hd_download", "no_ads", "story_archive", "api_access"],
  },
};

export const ANON_LIMITS = { dailyLookups: 15, dailyDownloads: 5 };

export function planOf(id?: string | null): Plan {
  return PLANS[(id as PlanId) ?? "free"] ?? PLANS.free;
}

export function hasFeature(planId: PlanId | undefined, f: Feature): boolean {
  return planOf(planId).features.includes(f);
}

export const FEATURE_LABELS: Record<Feature, { ar: string; en: string }> = {
  batch_download: { ar: "تحميل جماعي", en: "Batch download" },
  watchlist: { ar: "قائمة مراقبة الحسابات", en: "Account watchlist" },
  compare: { ar: "مقارنة الحسابات", en: "Compare accounts" },
  advanced_analytics: { ar: "تحليلات متقدمة", en: "Advanced analytics" },
  export_csv: { ar: "تصدير CSV", en: "CSV export" },
  hd_download: { ar: "تحميل بأعلى جودة", en: "HD downloads" },
  api_access: { ar: "وصول API للمطورين", en: "Developer API access" },
  no_ads: { ar: "بدون إعلانات", en: "No ads" },
  story_archive: { ar: "أرشيف الستوري", en: "Story archive" },
};
