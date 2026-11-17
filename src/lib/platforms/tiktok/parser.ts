/**
 * Pure parsers that turn TikTok's embedded page JSON into our domain model.
 * Kept free of I/O so they can be unit-tested against saved fixtures.
 */
import type { Post, Profile } from "../types";
import { extractHashtags } from "../../format";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

/** TikTok item ids encode the creation time in their top 32 bits. */
export function timeFromId(id: string): number | undefined {
  try {
    const secs = Number(BigInt(id) >> 32n);
    return secs > 1_400_000_000 && secs < 4_000_000_000 ? secs : undefined;
  } catch {
    return undefined;
  }
}

const num = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : undefined;
};

export function parseUserDetail(json: Any): { status: number; profile?: Profile; items: Post[] } {
  const scope = json?.__DEFAULT_SCOPE__ ?? {};
  const ud = scope["webapp.user-detail"];
  if (!ud) return { status: -1, items: [] };
  const status: number = ud.statusCode ?? 0;
  const info = ud.userInfo;
  if (status !== 0 || !info?.user?.uniqueId) return { status: status || 404, items: [] };
  const u = info.user;
  const s = info.statsV2 ?? info.stats ?? {};
  const profile: Profile = {
    platform: "tiktok",
    id: String(u.id),
    username: u.uniqueId,
    displayName: u.nickname || u.uniqueId,
    bio: u.signature || "",
    avatarUrl: u.avatarLarger || u.avatarMedium || u.avatarThumb || "",
    verified: !!u.verified,
    isPrivate: !!(u.privateAccount || u.secret),
    isBusiness: !!u.commerceUserInfo?.commerceUser,
    category: u.commerceUserInfo?.category,
    externalUrl: u.bioLink?.link,
    followers: num(s.followerCount) ?? 0,
    following: num(s.followingCount) ?? 0,
    likes: Math.max(num(s.heartCount) ?? 0, num(s.heart) ?? 0),
    postsCount: num(s.videoCount) ?? 0,
    createdAt: u.createTime || undefined,
    language: u.language,
    region: (typeof u.region === "string" && /^[A-Za-z]{2}$/.test(u.region) ? u.region.toUpperCase() : undefined),
    secUid: u.secUid || undefined,
    hasStory: !!u.UserStoryStatus,
    followingVisibility: typeof u.followingVisibility === "number" ? u.followingVisibility : undefined,
    profileUrl: `https://www.tiktok.com/@${u.uniqueId}`,
  };
  const items: Post[] = Array.isArray(info.itemList) ? info.itemList.map((it: Any) => parseItemStruct(it)).filter(Boolean) : [];
  return { status: 0, profile, items };
}

export function parseEmbedState(json: Any, username: string): { profile?: Partial<Profile>; posts: Post[] } {
  const data = json?.source?.data ?? {};
  const key = Object.keys(data).find((k) => k.startsWith("/embed/@")) ?? `/embed/@${username}`;
  const page = data[key];
  if (!page) return { posts: [] };
  const ui = page.userInfo ?? {};
  const posts: Post[] = (page.videoList ?? [])
    .filter((v: Any) => v && v.id && !v.privateItem)
    .map((v: Any): Post => {
      const caption: string = v.desc ?? "";
      const author = v.authorUniqueId || ui.uniqueId || username;
      return {
        platform: "tiktok",
        id: String(v.id),
        author,
        caption,
        type: "video",
        cover: v.originCoverUrl || v.coverUrl || "",
        media: v.playAddr ? [{ type: "video", url: v.playAddr, thumbnail: v.coverUrl, width: v.width, height: v.height }] : [],
        createdAt: timeFromId(String(v.id)),
        stats: { views: num(v.playCount) },
        hashtags: extractHashtags(caption),
        url: `https://www.tiktok.com/@${author}/video/${v.id}`,
      };
    });
  const profile: Partial<Profile> | undefined = ui.uniqueId
    ? {
        id: String(ui.id ?? ""),
        username: ui.uniqueId,
        displayName: ui.nickname,
        bio: ui.signature,
        avatarUrl: ui.avatarThumbUrl,
        verified: !!ui.verified,
        isPrivate: !!ui.privateAccount,
        followers: num(ui.followerCount) ?? 0,
        following: num(ui.followingCount) ?? 0,
      }
    : undefined;
  return { profile, posts };
}

export function parseItemStruct(it: Any): Post {
  const caption: string = it.desc ?? "";
  const author: string = it.author?.uniqueId ?? it.author ?? "";
  const st = it.statsV2 ?? it.stats ?? {};
  const v = it.video ?? {};
  const images: Any[] = it.imagePost?.images ?? [];
  const isPhoto = images.length > 0;
  const tags = new Set<string>(extractHashtags(caption));
  (it.challenges ?? []).forEach((c: Any) => c?.title && tags.add(String(c.title).toLowerCase()));
  (it.textExtra ?? []).forEach((t: Any) => t?.hashtagName && tags.add(String(t.hashtagName).toLowerCase()));
  const media = isPhoto
    ? images.map((im: Any) => ({
        type: "image" as const,
        url: im.imageURL?.urlList?.[0] ?? "",
        width: im.imageWidth,
        height: im.imageHeight,
      }))
    : [
        {
          type: "video" as const,
          url: v.playAddr || v.downloadAddr || "",
          thumbnail: v.cover,
          width: v.width,
          height: v.height,
        },
      ].filter((m) => m.url);
  const place: string | undefined = it.poi?.name || it.poi?.cityName || undefined;
  const country: string | undefined = typeof it.locationCreated === "string" && /^[A-Z]{2}$/.test(it.locationCreated) ? it.locationCreated : undefined;
  return {
    platform: "tiktok",
    ...(country || place ? { location: { country, place } } : {}),
    id: String(it.id),
    author,
    caption,
    type: isPhoto ? (images.length > 1 ? "carousel" : "image") : "video",
    cover: v.originCover || v.cover || images[0]?.imageURL?.urlList?.[0] || "",
    media,
    createdAt: num(it.createTime) ?? timeFromId(String(it.id)),
    duration: num(v.duration),
    stats: {
      views: num(st.playCount),
      likes: num(st.diggCount),
      comments: num(st.commentCount),
      shares: num(st.shareCount),
      saves: num(st.collectCount),
    },
    hashtags: [...tags],
    music: it.music ? { title: it.music.title ?? "", author: it.music.authorName ?? "", url: it.music.playUrl } : undefined,
    url: `https://www.tiktok.com/@${author}/video/${it.id}`,
  };
}

export function parseVideoDetail(json: Any): { status: number; post?: Post } {
  // Desktop pages use "webapp.video-detail"; mobile-UA (e.g. the relay Worker) gets the "reflow" layout.
  const scope = json?.__DEFAULT_SCOPE__ ?? {};
  const vd = scope["webapp.video-detail"] ?? scope["webapp.reflow.video.detail"];
  if (!vd) return { status: -1 };
  const it = vd.itemInfo?.itemStruct;
  if (vd.statusCode !== 0 || !it?.id) return { status: vd.statusCode || 404 };
  return { status: 0, post: parseItemStruct(it) };
}

/** Accepts a TikTok URL or a raw numeric id; returns { id, username? }. */
export function parseTikTokRef(input: string): { id?: string; username?: string; shortUrl?: string } {
  const s = input.trim();
  if (/^\d{15,22}$/.test(s)) return { id: s };
  const m = s.match(/tiktok\.com\/@([A-Za-z0-9._]+)\/(?:video|photo)\/(\d{15,22})/i);
  if (m) return { username: m[1], id: m[2] };
  if (/^(https?:\/\/)?(vm|vt)\.tiktok\.com\/\w+/i.test(s) || /tiktok\.com\/t\/\w+/i.test(s))
    return { shortUrl: s.startsWith("http") ? s : `https://${s}` };
  return {};
}
