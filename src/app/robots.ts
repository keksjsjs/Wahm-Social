import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";
import { getSettings } from "@/lib/site/store";

export const dynamic = "force-dynamic";

/** The secret admin path is never listed here (that would reveal it); it is noindex via header + meta instead. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSettings();
  if (!s.seo.robotsIndex) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/account", "/admin", "/cpanel-internal", "/login", "/register"] }],
    sitemap: absUrl("/sitemap.xml"),
    host: absUrl("/"),
  };
}
