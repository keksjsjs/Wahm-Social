import type { Metadata } from "next";
import { DEFAULT_SETTINGS } from "./defaults";
import type { SiteSettings } from "./types";

const assetUrl = (name: string) => `/api/site-asset/${name}`;

/** Site-wide metadata built from admin settings. */
export function siteMetadata(s: SiteSettings): Metadata {
  const seo = s.seo;
  const name = s.brand.siteName.en || "Frostly";
  const icon = s.assets.favicon ? assetUrl(s.assets.favicon) : "/icon.svg";
  const og = s.assets.ogImage ? assetUrl(s.assets.ogImage) : "/api/og";
  const verification: Metadata["verification"] = {};
  if (seo.googleVerification) verification.google = seo.googleVerification;
  if (seo.bingVerification) verification.other = { "msvalidate.01": seo.bingVerification };
  return {
    title: { default: seo.defaultTitle || DEFAULT_SETTINGS.seo.defaultTitle, template: seo.titleTemplate || "%s" },
    description: seo.description || DEFAULT_SETTINGS.seo.description,
    applicationName: name,
    authors: [{ name: "Wahm", url: "https://x.com/iwahm" }],
    keywords: seo.keywords.length ? seo.keywords : DEFAULT_SETTINGS.seo.keywords,
    icons: { icon, apple: icon, shortcut: icon },
    category: "technology",
    openGraph: { siteName: name, type: "website", images: [og] },
    twitter: { card: "summary_large_image", site: seo.twitterHandle || undefined, images: [og] },
    formatDetection: { telephone: false },
    verification,
    robots: seo.robotsIndex ? undefined : { index: false, follow: false },
  };
}
