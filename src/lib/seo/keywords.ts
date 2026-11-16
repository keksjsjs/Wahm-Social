/**
 * High-volume search keywords (EN + AR). Used in <meta keywords>, landing copy,
 * the "Popular searches" link hub and tool pages. Grouped by intent.
 */
export const KEYWORDS = {
  tiktokDownload: {
    en: [
      "tiktok downloader",
      "tiktok video downloader",
      "download tiktok without watermark",
      "tiktok downloader no watermark",
      "save tiktok video",
      "tiktok to mp4",
      "tiktok mp3 downloader",
      "tiktok to mp3",
      "snaptik alternative",
      "ssstik alternative",
      "tiktok photo slideshow download",
      "download tiktok hd",
    ],
    ar: [
      "تحميل من تيك توك",
      "تحميل فيديو تيك توك",
      "تحميل فيديو تيك توك بدون علامة مائية",
      "تنزيل فيديو تيك توك",
      "حفظ فيديو تيك توك",
      "تحميل تيك توك بدون حقوق",
      "تحميل صوت تيك توك mp3",
      "برنامج تحميل من تيك توك",
      "موقع تحميل تيك توك",
    ],
  },
  instagramDownload: {
    en: [
      "instagram downloader",
      "instagram reels downloader",
      "download instagram reels",
      "instagram video downloader",
      "instagram photo downloader",
      "save instagram post",
      "igdownloader",
      "snapinsta alternative",
      "instagram carousel download",
    ],
    ar: [
      "تحميل من انستقرام",
      "تحميل ريلز انستقرام",
      "تحميل فيديو انستا",
      "تنزيل ريلز انستا",
      "حفظ صور انستقرام",
      "موقع تحميل من الانستقرام",
      "تحميل مقاطع انستقرام",
    ],
  },
  stories: {
    en: [
      "instagram story viewer",
      "instagram story downloader",
      "view instagram stories",
      "story saver",
      "insta story viewer",
      "instagram highlights viewer",
    ],
    ar: ["مشاهدة ستوري انستقرام", "تحميل ستوري انستا", "حفظ ستوري انستقرام", "عرض ستوري الانستا", "تحميل قصص انستقرام"],
  },
  viewer: {
    en: [
      "tiktok profile viewer",
      "instagram profile viewer",
      "tiktok viewer",
      "instagram viewer",
      "view tiktok without account",
      "view instagram without account",
      "instagram profile picture viewer",
      "insta viewer",
      "picuki alternative",
      "tiktok user search",
      "tiktok account lookup",
    ],
    ar: [
      "عرض حساب تيك توك",
      "عرض حساب انستقرام",
      "البحث عن حساب تيك توك",
      "البحث عن حساب انستقرام",
      "مشاهدة حساب انستا بدون حساب",
      "تكبير صورة بروفايل انستقرام",
      "معرفة متابعين حساب",
      "عدد متابعين تيك توك",
    ],
  },
  analytics: {
    en: [
      "tiktok analytics",
      "instagram analytics",
      "engagement rate calculator",
      "tiktok engagement rate calculator",
      "instagram engagement rate calculator",
      "tiktok follower count",
      "live follower count tiktok",
      "tiktok money calculator",
      "influencer earnings calculator",
      "best time to post on tiktok",
      "tiktok hashtag generator",
      "socialblade alternative",
    ],
    ar: [
      "تحليل حساب تيك توك",
      "تحليل حساب انستقرام",
      "حساب معدل التفاعل",
      "حاسبة أرباح تيك توك",
      "كم يربح المؤثر",
      "أفضل وقت للنشر في تيك توك",
      "هاشتاقات تيك توك",
      "زيادة متابعين تيك توك",
      "عداد متابعين مباشر",
    ],
  },
};

export type KeywordGroup = keyof typeof KEYWORDS;

export function keywordsFor(groups: KeywordGroup[], extra: string[] = []): string[] {
  const out = new Set<string>(extra);
  for (const g of groups) {
    KEYWORDS[g].en.forEach((k) => out.add(k));
    KEYWORDS[g].ar.forEach((k) => out.add(k));
  }
  return [...out];
}

export const ALL_KEYWORDS = keywordsFor(["tiktokDownload", "instagramDownload", "stories", "viewer", "analytics"], ["Frostly", "فروستلي"]);
