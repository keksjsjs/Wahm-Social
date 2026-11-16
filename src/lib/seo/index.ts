/** SEO helpers: metadata builders and JSON-LD structured data. */
import type { Metadata } from "next";
import { env } from "../env";
import type { Post, Profile } from "../platforms/types";
import { compact } from "../format";

export const SITE_NAME = "Frostly";
export const SITE_NAME_AR = "فروستلي";
export const DEFAULT_DESCRIPTION =
  "فروستلي: تحميل فيديو تيك توك بدون علامة مائية، تحميل ريلز وستوري انستقرام، عرض الحسابات ومعرفة المتابعين وتحليل التفاعل مجاناً. Frostly — TikTok downloader no watermark, Instagram reels & story downloader, profile viewer and analytics.";

export const absUrl = (path = "/") => `${env.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;

export function buildMetadata(opts: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  keywords?: string[];
  type?: "website" | "profile" | "article" | "video.other";
}): Metadata {
  const description = opts.description ?? DEFAULT_DESCRIPTION;
  const url = absUrl(opts.path ?? "/");
  const latin = opts.title.split(/[|—]/).map((x) => x.trim()).find((x) => /[A-Za-z]{3}/.test(x) && !/[\u0600-\u06FF]/.test(x)) ?? "Frostly";
  const image = opts.image ?? absUrl(`/api/og?title=${encodeURIComponent(latin)}`);
  return {
    title: opts.title,
    description,
    keywords: opts.keywords,
    alternates: { canonical: url, languages: { ar: url, en: url, "x-default": url } },
    openGraph: {
      title: opts.title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630 }],
      locale: "ar_SA",
      alternateLocale: ["en_US"],
      type: opts.type === "video.other" ? "video.other" : opts.type === "article" ? "article" : opts.type === "profile" ? "profile" : "website",
    },
    twitter: { card: "summary_large_image", title: opts.title, description, images: [image], site: "@iwahm" },
    robots: opts.noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large" },
  };
}

export function profileMetadata(p: Profile): Metadata {
  const plat = p.platform === "tiktok" ? "TikTok" : "Instagram";
  const title = `${p.displayName} (@${p.username}) ${plat} — ${compact(p.followers, "en")} followers, posts & downloads | Frostly`;
  const description = `${p.displayName} @${p.username} على ${p.platform === "tiktok" ? "تيك توك" : "انستقرام"}: ${compact(p.followers)} متابع، ${compact(
    p.postsCount,
  )} منشور. شاهد المنشورات والإحصائيات وحمّل الفيديو بدون علامة مائية. ${p.bio.slice(0, 120)}`;
  return buildMetadata({
    title,
    description,
    path: `/${p.platform}/${p.username}`,
    image: absUrl(`/api/og?u=${encodeURIComponent(p.username)}&p=${p.platform}&f=${p.followers}&n=${encodeURIComponent(p.displayName)}`),
    type: "profile",
    keywords: [p.username, p.displayName, `@${p.username}`, `${p.username} ${plat}`, `${p.username} followers`, `${p.username} ${plat} downloader`, `تحميل فيديوهات ${p.username}`, `متابعين ${p.username}`, `${plat} viewer`, `${plat} downloader`, "عرض حساب", "تحليل حساب"],
  });
}

export function jsonLdWebsite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_NAME_AR,
    url: absUrl("/"),
    inLanguage: ["ar", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: absUrl("/search?q={search_term_string}") },
      "query-input": "required name=search_term_string",
    },
  };
}

export function jsonLdOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absUrl("/"),
    logo: absUrl("/icon.svg"),
    sameAs: ["https://x.com/iwahm"],
  };
}

export function jsonLdSoftware() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" },
      { "@type": "Offer", price: "7.99", priceCurrency: "USD", name: "Pro" },
    ],
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1280" },
  };
}

export function jsonLdProfile(p: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: p.displayName,
      alternateName: `@${p.username}`,
      description: p.bio,
      image: p.avatarUrl,
      sameAs: [p.profileUrl],
      interactionStatistic: [
        { "@type": "InteractionCounter", interactionType: "https://schema.org/FollowAction", userInteractionCount: p.followers },
      ],
    },
  };
}

export function jsonLdVideo(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": post.type === "video" ? "VideoObject" : "ImageObject",
    name: post.caption.slice(0, 100) || `${post.author} post`,
    description: post.caption.slice(0, 300),
    thumbnailUrl: post.cover,
    uploadDate: post.createdAt ? new Date(post.createdAt * 1000).toISOString() : undefined,
    duration: post.duration ? `PT${Math.round(post.duration)}S` : undefined,
    author: { "@type": "Person", name: post.author },
    interactionStatistic: post.stats.likes
      ? [{ "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: post.stats.likes }]
      : undefined,
  };
}

export function jsonLdBreadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absUrl(it.path) })),
  };
}

export function jsonLdFaq(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
