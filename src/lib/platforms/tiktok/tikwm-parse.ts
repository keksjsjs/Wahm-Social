/**
 * Pure mappers for tikwm.com JSON payloads. No I/O — unit-tested.
 */
import type { Post, Profile, Story } from "../types";
import { asCountry, asNum, isRecord } from "./fallback-http";
import { extractHashtags } from "../../format";

export interface TikwmVideoMedia {
  id?: string;
  play: string;
  music?: string;
  cover?: string;
  region?: string;
  author?: string;
  title?: string;
  duration?: number;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

export function profileFromTikwm(data: unknown): Profile | null {
  if (!isRecord(data)) return null;
  const user = isRecord(data.user) ? data.user : data;
  const stats = isRecord(data.stats) ? data.stats : {};
  const username = str(user.uniqueId || user.unique_id).replace(/^@/, "");
  if (!username) return null;
  const id = str(user.id || user.uid);
  const bioLink = isRecord(user.bioLink) ? user.bioLink : undefined;
  return {
    platform: "tiktok",
    id: id || username,
    username,
    displayName: str(user.nickname) || username,
    bio: str(user.signature),
    avatarUrl: str(user.avatarLarger || user.avatarMedium || user.avatarThumb || user.avatar),
    verified: !!user.verified,
    isPrivate: !!(user.privateAccount || user.secret),
    isBusiness: !!(isRecord(user.commerceUserInfo) && user.commerceUserInfo.commerceUser),
    externalUrl: bioLink ? str(bioLink.link) || undefined : undefined,
    followers: asNum(stats.followerCount) ?? 0,
    following: asNum(stats.followingCount) ?? 0,
    likes: Math.max(asNum(stats.heartCount) ?? 0, asNum(stats.heart) ?? 0),
    postsCount: asNum(stats.videoCount) ?? 0,
    createdAt: asNum(user.createTime) || undefined,
    language: typeof user.language === "string" && user.language ? user.language : undefined,
    // Country is never taken from tikwm user info (only from a real video region later).
    secUid: str(user.secUid || user.sec_uid) || undefined,
    hasStory: Number(user.UserStoryStatus ?? user.userStoryStatus ?? 0) > 0,
    followingVisibility: typeof user.followingVisibility === "number" ? user.followingVisibility : undefined,
    profileUrl: `https://www.tiktok.com/@${username}`,
  };
}

export function storiesFromTikwm(data: unknown, username: string): Story[] {
  const root = isRecord(data) ? data : {};
  const list: unknown[] = Array.isArray(root.videos)
    ? root.videos
    : Array.isArray(root.aweme_list)
      ? root.aweme_list
      : Array.isArray(data)
        ? data
        : [];
  const out: Story[] = [];
  list.forEach((raw, i) => {
    if (!isRecord(raw)) return;
    const play = str(raw.play || raw.hdplay || raw.wmplay || raw.play_addr);
    const images = Array.isArray(raw.images) ? raw.images.map(str).filter(Boolean) : [];
    const imageUrl = images[0] || str(raw.origin_cover || raw.cover);
    const isVideo = !!play;
    const url = isVideo ? play : imageUrl;
    if (!url) return;
    const id = str(raw.id || raw.aweme_id) || `${username}-story-${i}`;
    const takenAt = asNum(raw.create_time ?? raw.createTime);
    out.push({
      platform: "tiktok",
      id,
      author: username,
      type: isVideo ? "video" : "image",
      url,
      thumbnail: str(raw.cover || raw.origin_cover) || imageUrl || url,
      takenAt,
      expiresAt: takenAt ? takenAt + 24 * 60 * 60 : undefined,
    });
  });
  return out;
}

export function mediaFromTikwm(data: unknown): TikwmVideoMedia | null {
  if (!isRecord(data)) return null;
  const play = str(data.hdplay || data.play || data.wmplay);
  if (!play) return null;
  const author = isRecord(data.author) ? str(data.author.unique_id || data.author.uniqueId || data.author.nickname) : undefined;
  return {
    id: str(data.id) || undefined,
    play,
    music: str(data.music) || undefined,
    cover: str(data.cover || data.origin_cover) || undefined,
    region: asCountry(data.region),
    author: author || undefined,
    title: str(data.title) || undefined,
    duration: asNum(data.duration),
  };
}

export function postFromTikwm(data: unknown, username?: string): Post | null {
  const media = mediaFromTikwm(data);
  if (!media || !isRecord(data)) return null;
  const author = media.author || username || "i";
  const id = media.id;
  if (!id) return null;
  const caption = str(data.title);
  const region = media.region;
  return {
    platform: "tiktok",
    id,
    author,
    caption,
    type: "video",
    cover: media.cover || "",
    media: [{ type: "video", url: media.play, thumbnail: media.cover }],
    duration: media.duration,
    stats: {
      views: asNum(data.play_count ?? data.playCount),
      likes: asNum(data.digg_count ?? data.diggCount),
      comments: asNum(data.comment_count ?? data.commentCount),
      shares: asNum(data.share_count ?? data.shareCount),
    },
    hashtags: extractHashtags(caption),
    music: media.music ? { title: "", author: "", url: media.music } : undefined,
    url: `https://www.tiktok.com/@${author}/video/${id}`,
    ...(region ? { location: { country: region } } : {}),
  };
}

/** Unwrap `{ code, data }` tikwm envelopes. code === 0 is success. */
export function unwrapTikwm(json: unknown): { ok: true; data: unknown } | { ok: false; notFound?: boolean } {
  if (!isRecord(json)) return { ok: false };
  const code = json.code;
  if (code === 0) return { ok: true, data: json.data ?? null };
  const msg = str(json.msg || json.message).toLowerCase();
  const notFound = /not found|doesn't exist|does not exist|invalid user|no user/i.test(msg);
  return { ok: false, notFound };
}
