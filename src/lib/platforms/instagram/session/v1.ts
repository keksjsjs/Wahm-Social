/** Parsers for Instagram's private-app (v1) JSON shapes: users/{pk}/info, search results, feed/user items. */
import type { Post, Profile } from "../../types";
import { extractHashtags } from "../../../format";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

export function parseV1User(u: Any): Profile | null {
  if (!u?.username) return null;
  return {
    platform: "instagram",
    id: String(u.pk ?? u.pk_id ?? u.id ?? u.username),
    username: u.username,
    displayName: u.full_name || u.username,
    bio: u.biography || "",
    avatarUrl: u.hd_profile_pic_url_info?.url || u.profile_pic_url || "",
    verified: !!u.is_verified,
    isPrivate: !!u.is_private,
    isBusiness: !!(u.is_business || u.is_professional_account),
    category: u.category || undefined,
    externalUrl: u.external_url || undefined,
    followers: u.follower_count ?? 0,
    following: u.following_count ?? 0,
    postsCount: u.media_count ?? 0,
    profileUrl: `https://www.instagram.com/${u.username}/`,
  };
}

/** Pick the exact username match from topsearch / users/search results. */
export function pickSearchUser(json: Any, username: string): Any | null {
  const list: Any[] = (json?.users ?? []).map((x: Any) => x?.user ?? x);
  return list.find((u) => String(u?.username).toLowerCase() === username.toLowerCase()) ?? null;
}

function bestImage(it: Any): string {
  return it?.image_versions2?.candidates?.[0]?.url ?? "";
}

export function parseV1Media(it: Any, author: string): Post {
  const caption: string = it.caption?.text ?? "";
  const children: Any[] = it.carousel_media ?? [];
  const nodes = children.length ? children : [it];
  const media = nodes.map((c) =>
    c.media_type === 2
      ? { type: "video" as const, url: c.video_versions?.[0]?.url ?? "", thumbnail: bestImage(c) }
      : { type: "image" as const, url: bestImage(c) },
  );
  const code = it.code ?? String(it.pk);
  return {
    platform: "instagram",
    id: String(it.pk ?? it.id),
    shortcode: it.code,
    author: it.user?.username ?? author,
    caption,
    type: children.length > 1 ? "carousel" : it.media_type === 2 ? "video" : "image",
    cover: bestImage(children[0] ?? it),
    media: media.filter((m) => m.url),
    createdAt: it.taken_at,
    duration: it.video_duration,
    stats: { views: it.play_count ?? it.view_count, likes: it.like_count, comments: it.comment_count },
    hashtags: extractHashtags(caption),
    url: `https://www.instagram.com/p/${code}/`,
  };
}
