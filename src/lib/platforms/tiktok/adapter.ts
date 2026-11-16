import "server-only";
/**
 * TikTok adapter — uses only public, logged-out web pages:
 *  - https://www.tiktok.com/@user            (profile SSR JSON)
 *  - https://www.tiktok.com/embed/@user      (recent public videos)
 *  - https://www.tiktok.com/@user/video/:id  (post detail SSR JSON)
 * Followers/following lists and stories require signed, logged-in APIs and are
 * therefore reported as unavailable instead of being bypassed.
 */
import { cookiesFrom, extractScriptJson, httpGet, looksLikeBotWall } from "../../server/http";
import { PlatformError, type PlatformAdapter, type Post, type Profile, type Story } from "../types";
import { parseEmbedState, parseTikTokRef, parseUserDetail, parseVideoDetail } from "./parser";
import { mapLimit } from "../../server/concurrency";

const BASE = "https://www.tiktok.com";

async function fetchProfilePage(username: string) {
  const res = await httpGet(`${BASE}/@${encodeURIComponent(username)}?lang=en`, { retries: 1 });
  if (looksLikeBotWall(res.text)) throw new PlatformError("blocked", "TikTok temporarily blocked the request", 503);
  const json = extractScriptJson(res.text, "__UNIVERSAL_DATA_FOR_REHYDRATION__");
  if (!json) throw new PlatformError("blocked", "TikTok returned an unexpected page", 503);
  return parseUserDetail(json);
}

async function fetchEmbed(username: string) {
  const res = await httpGet(`${BASE}/embed/@${encodeURIComponent(username)}`, { retries: 1 });
  const json = extractScriptJson(res.text, "__FRONTITY_CONNECT_STATE__");
  if (!json) return { posts: [] as Post[] };
  return parseEmbedState(json, username);
}

export async function fetchVideoPage(username: string, id: string): Promise<{ post: Post; cookie: string }> {
  const res = await httpGet(`${BASE}/@${encodeURIComponent(username || "i")}/video/${id}?lang=en`, { retries: 1 });
  if (looksLikeBotWall(res.text)) throw new PlatformError("blocked", "TikTok temporarily blocked the request", 503);
  const json = extractScriptJson(res.text, "__UNIVERSAL_DATA_FOR_REHYDRATION__");
  if (!json) throw new PlatformError("blocked", "TikTok returned an unexpected page", 503);
  const { status, post } = parseVideoDetail(json);
  if (status !== 0 || !post) throw new PlatformError("not_found", "Video not found or not public", 404);
  return { post, cookie: cookiesFrom(res.headers) };
}

async function resolveShortUrl(url: string): Promise<{ id?: string; username?: string }> {
  const res = await httpGet(url, { retries: 0 });
  return parseTikTokRef(res.url);
}

export const tiktok: PlatformAdapter & {
  enrich(posts: Post[], max?: number): Promise<Post[]>;
} = {
  platform: "tiktok",

  async getProfile(username) {
    const { status, profile } = await fetchProfilePage(username);
    if (status === 10221 || status === 10202 || status === 404 || !profile) {
      throw new PlatformError("not_found", `@${username} was not found on TikTok`, 404);
    }
    return profile;
  },

  async getPosts(username, opts) {
    const limit = opts?.limit ?? 12;
    const [page, embed] = await Promise.allSettled([fetchProfilePage(username), fetchEmbed(username)]);
    const fromPage = page.status === "fulfilled" ? page.value.items : [];
    if (page.status === "fulfilled" && page.value.profile?.isPrivate) {
      throw new PlatformError("private_account", "This account is private", 403);
    }
    const fromEmbed = embed.status === "fulfilled" ? embed.value.posts : [];
    const seen = new Set<string>();
    const merged = [...fromPage, ...fromEmbed].filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
    if (!merged.length && page.status === "rejected" && embed.status === "rejected") throw page.reason;
    return merged.slice(0, limit);
  },

  /** Fill likes/comments/shares for embed posts by reading each public video page. */
  async enrich(posts, max = 12) {
    const head = posts.slice(0, max);
    const enriched = await mapLimit(head, 4, async (p) => {
      if (p.stats.likes !== undefined) return p;
      try {
        const { post } = await fetchVideoPage(p.author, p.id);
        return { ...post, media: p.media.length ? p.media : post.media, cover: p.cover || post.cover };
      } catch {
        return p;
      }
    });
    return [...enriched, ...posts.slice(max)];
  },

  async getPost(idOrUrl, username) {
    let ref = parseTikTokRef(idOrUrl);
    if (ref.shortUrl) ref = await resolveShortUrl(ref.shortUrl);
    if (!ref.id) throw new PlatformError("invalid_input", "Paste a valid TikTok video link", 400);
    const { post } = await fetchVideoPage(ref.username ?? username ?? "i", ref.id);
    return post;
  },

  async getStories(): Promise<Story[]> {
    // TikTok stories are only served via signed, logged-in endpoints.
    return [];
  }
};
