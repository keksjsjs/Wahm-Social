/**
 * Parse Instagram's public link-preview (Open Graph) markup — the same data
 * Instagram serves to chat apps when a profile/post link is shared.
 */
import type { Post, Profile } from "../../types";
import { extractHashtags } from "../../../format";

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));

export function meta(html: string, prop: string): string | undefined {
  const re = new RegExp(`<meta[^>]+(?:property|name)="${prop.replace(/[:.]/g, "\\$&")}"[^>]+content="([^"]*)"`, "i");
  const m = html.match(re);
  return m ? decode(m[1]) : undefined;
}

/** "268M" / "1,234" / "12.5K" / "1.2B" → number */
export function parseCount(raw: string): number {
  const s = raw.replace(/,/g, "").trim();
  const m = s.match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] ?? "").toUpperCase() as "K" | "M" | "B"] ?? 1;
  return Math.round(n * mult);
}

export function parseOgProfile(html: string, username: string): Profile | null {
  const title = meta(html, "og:title");
  const desc = meta(html, "og:description") ?? meta(html, "description") ?? "";
  const type = meta(html, "og:type");
  if (!title || type !== "profile") return null;
  const counts = desc.match(/([\d.,]+[KMB]?)\s+Followers?,\s*([\d.,]+[KMB]?)\s+Following,\s*([\d.,]+[KMB]?)\s+Posts?/i);
  const name = title.replace(/\s*\(@[^)]+\)[\s\S]*$/, "").trim();
  const handle = title.match(/\(@([^)]+)\)/)?.[1] ?? username;
  const bio = desc.split(/ - See Instagram photos and videos from/i)[0].replace(counts?.[0] ?? "", "").trim();
  return {
    platform: "instagram",
    id: handle,
    username: handle.toLowerCase(),
    displayName: name || handle,
    bio: bio && !/^see instagram/i.test(bio) ? bio : "",
    avatarUrl: meta(html, "og:image") ?? "",
    verified: false,
    isPrivate: /This account is private/i.test(html),
    followers: counts ? parseCount(counts[1]) : 0,
    following: counts ? parseCount(counts[2]) : 0,
    postsCount: counts ? parseCount(counts[3]) : 0,
    preview: true,
    profileUrl: `https://www.instagram.com/${handle}/`,
  };
}

export function parseOgPost(html: string, shortcode: string): Post | null {
  const image = meta(html, "og:image");
  const video = meta(html, "og:video:secure_url") ?? meta(html, "og:video");
  const desc = meta(html, "og:description") ?? "";
  const url = meta(html, "og:url") ?? `https://www.instagram.com/p/${shortcode}/`;
  if (!image && !video) return null;
  const stats = desc.match(/([\d.,]+[KMB]?)\s+likes?,\s*([\d.,]+[KMB]?)\s+comments?\s+-\s+([A-Za-z0-9._]+)\s+on\s+([^:]+):\s*"?([\s\S]*?)"?\.?$/i);
  const author = stats?.[3] ?? url.match(/instagram\.com\/([A-Za-z0-9._]+)\/(?:p|reel)\//)?.[1] ?? "";
  const caption = stats?.[5]?.replace(/"$/, "") ?? "";
  const created = stats?.[4] ? Date.parse(stats[4]) : NaN;
  return {
    platform: "instagram",
    id: shortcode,
    shortcode,
    author,
    caption,
    type: video ? "video" : "image",
    cover: image ?? "",
    media: video ? [{ type: "video", url: video, thumbnail: image }] : [{ type: "image", url: image! }],
    createdAt: Number.isFinite(created) ? Math.floor(created / 1000) : undefined,
    stats: { likes: stats ? parseCount(stats[1]) : undefined, comments: stats ? parseCount(stats[2]) : undefined },
    hashtags: extractHashtags(caption),
    url: `https://www.instagram.com/p/${shortcode}/`,
  };
}
