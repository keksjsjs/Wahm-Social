/** Pure parsers for Instagram public web JSON (web_profile_info, embed pages, reels). */
import type { Post, Profile, Story } from "../types";
import { extractHashtags } from "../../format";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

export function parseWebProfile(json: Any): { profile: Profile; posts: Post[] } | null {
  const u = json?.data?.user;
  if (!u?.username) return null;
  const profile: Profile = {
    platform: "instagram",
    id: String(u.id),
    username: u.username,
    displayName: u.full_name || u.username,
    bio: u.biography || "",
    avatarUrl: u.profile_pic_url_hd || u.profile_pic_url || "",
    verified: !!u.is_verified,
    isPrivate: !!u.is_private,
    isBusiness: !!(u.is_business_account || u.is_professional_account),
    category: u.category_name || u.business_category_name || undefined,
    externalUrl: u.external_url || undefined,
    followers: u.edge_followed_by?.count ?? 0,
    following: u.edge_follow?.count ?? 0,
    postsCount: u.edge_owner_to_timeline_media?.count ?? 0,
    hasStory: !!u.has_clips || undefined,
    profileUrl: `https://www.instagram.com/${u.username}/`,
  };
  const edges: Any[] = u.edge_owner_to_timeline_media?.edges ?? [];
  const posts = edges.map((e) => parseGraphNode(e.node, u.username));
  return { profile, posts };
}

export function parseGraphNode(n: Any, author: string): Post {
  const caption: string = n.edge_media_to_caption?.edges?.[0]?.node?.text ?? n.caption?.text ?? "";
  const children: Any[] = n.edge_sidecar_to_children?.edges?.map((e: Any) => e.node) ?? [];
  const nodes = children.length ? children : [n];
  const media = nodes.map((c) =>
    c.is_video
      ? { type: "video" as const, url: c.video_url ?? "", thumbnail: c.display_url, width: c.dimensions?.width, height: c.dimensions?.height }
      : { type: "image" as const, url: c.display_url ?? "", width: c.dimensions?.width, height: c.dimensions?.height },
  );
  return {
    platform: "instagram",
    id: String(n.id),
    shortcode: n.shortcode,
    author: n.owner?.username ?? author,
    caption,
    type: children.length > 1 ? "carousel" : n.is_video ? "video" : "image",
    cover: n.thumbnail_src || n.display_url || "",
    media: media.filter((m) => m.url),
    createdAt: n.taken_at_timestamp,
    duration: n.video_duration,
    stats: {
      views: n.video_view_count ?? n.video_play_count,
      likes: n.edge_liked_by?.count ?? n.edge_media_preview_like?.count,
      comments: n.edge_media_to_comment?.count,
    },
    hashtags: extractHashtags(caption),
    url: `https://www.instagram.com/p/${n.shortcode}/`,
  };
}

/** Parse the public /p/{code}/embed/captioned/ page (works logged-out for public posts). */
export function parseEmbedHtml(html: string, shortcode: string): Post | null {
  const ctx = html.match(/"contextJSON":"((?:\\.|[^"\\])*)"/);
  if (ctx) {
    try {
      const inner = JSON.parse(JSON.parse(`"${ctx[1]}"`));
      const media = inner?.context?.media ?? inner?.gql_data?.shortcode_media;
      if (media) return parseGraphNode({ ...media, shortcode }, media.owner?.username ?? "");
    } catch {}
  }
  const img = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&");
  const video = html.match(/"video_url":"([^"]+)"/)?.[1];
  const user = html.match(/class="UsernameText"[^>]*>([^<]+)</)?.[1] ?? "";
  const caption = (html.match(/class="Caption"[^>]*>([\s\S]*?)<div class="CaptionComments/)?.[1] ?? "").replace(/<[^>]+>/g, " ").trim();
  if (!img && !video) return null;
  const v = video ? JSON.parse(`"${video}"`) : undefined;
  return {
    platform: "instagram",
    id: shortcode,
    shortcode,
    author: user,
    caption,
    type: v ? "video" : "image",
    cover: img ?? "",
    media: v ? [{ type: "video", url: v, thumbnail: img }] : [{ type: "image", url: img! }],
    stats: {},
    hashtags: extractHashtags(caption),
    url: `https://www.instagram.com/p/${shortcode}/`,
  };
}

export function parseReelsMedia(json: Any, author: string): Story[] {
  const reels = json?.reels_media ?? Object.values(json?.reels ?? {});
  const items: Any[] = reels?.[0]?.items ?? [];
  return items.map((it) => {
    const isVideo = it.media_type === 2;
    const img = it.image_versions2?.candidates?.[0]?.url ?? "";
    return {
      platform: "instagram" as const,
      id: String(it.pk ?? it.id),
      author,
      type: isVideo ? ("video" as const) : ("image" as const),
      url: isVideo ? it.video_versions?.[0]?.url ?? img : img,
      thumbnail: img,
      takenAt: it.taken_at,
      expiresAt: it.expiring_at,
    };
  });
}

export function parseInstagramRef(input: string): { shortcode?: string; username?: string } {
  const s = input.trim();
  const m = s.match(/instagram\.com\/(?:[A-Za-z0-9._]+\/)?(?:p|reel|reels|tv)\/([A-Za-z0-9_-]{5,})/i);
  if (m) return { shortcode: m[1] };
  if (/^[A-Za-z0-9_-]{8,14}$/.test(s)) return { shortcode: s };
  return {};
}
