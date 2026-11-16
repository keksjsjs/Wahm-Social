import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { KEYWORDS, type KeywordGroup } from "@/lib/seo/keywords";

const TARGET: Record<KeywordGroup, string> = {
  tiktokDownload: "/tools/tiktok-downloader",
  instagramDownload: "/tools/instagram-downloader",
  stories: "/tools/instagram-story-viewer",
  viewer: "/tools/tiktok-profile-viewer",
  analytics: "/tools/tiktok-engagement-calculator",
};

const TITLES: Record<KeywordGroup, { ar: string; en: string }> = {
  tiktokDownload: { ar: "تحميل تيك توك", en: "TikTok download" },
  instagramDownload: { ar: "تحميل انستقرام", en: "Instagram download" },
  stories: { ar: "ستوري انستقرام", en: "Instagram stories" },
  viewer: { ar: "عرض الحسابات", en: "Profile viewer" },
  analytics: { ar: "التحليلات", en: "Analytics" },
};

/** Internal-link hub for high-volume queries (helps crawlers & users). */
export function PopularSearches({ locale }: { locale: Locale }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {(Object.keys(KEYWORDS) as KeywordGroup[]).map((g) => (
        <div key={g} className="card p-5">
          <h3 className="mb-3 text-sm font-bold text-accent-600 dark:text-accent-300">{TITLES[g][locale]}</h3>
          <ul className="space-y-1.5">
            {[...KEYWORDS[g][locale], ...KEYWORDS[g][locale === "ar" ? "en" : "ar"]].slice(0, 9).map((k) => (
              <li key={k}>
                <Link href={TARGET[g]} className="text-xs leading-6 text-ink-3 hover:text-ink">
                  {k}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
