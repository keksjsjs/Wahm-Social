/**
 * Instagram adapter — public endpoints only.
 *  - /api/v1/users/web_profile_info/?username=  (public profile + 12 recent posts)
 *  - /p/{shortcode}/embed/captioned/              (public post media)
 *  - /api/v1/feed/reels_media/                    (public stories; needs IG_SESSIONID)
 * Instagram aggressively rate-limits datacenter IPs. Configure IG_SESSIONID
 * and/or SCRAPER_PROXY for production reliability. Private accounts are never
 * bypassed: their content is reported as locked.
 */
import { env } from "../../env";
import { httpGet, MOBILE_UA } from "../../server/http";
import { PlatformError, type ConnectionsResult, type PlatformAdapter, type Post, type Profile, type Story } from "../types";
import { parseEmbedHtml, parseInstagramRef, parseReelsMedia, parseWebProfile } from "./parser";

const IG_APP_ID = "936619743392459";

function igHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    "x-ig-app-id": IG_APP_ID,
    "x-asbd-id": "129477",
    "x-requested-with": "XMLHttpRequest",
    accept: "*/*",
    referer: "https://www.instagram.com/",
    "user-agent": MOBILE_UA,
  };
  if (env.igSessionId) h.cookie = `sessionid=${env.igSessionId}`;
  return h;
}

async function webProfile(username: string) {
  const urls = [
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
  ];
  let lastStatus = 0;
  for (const url of urls) {
    const res = await httpGet(url, { headers: igHeaders(), retries: 0, timeoutMs: 10000 });
    lastStatus = res.status;
    if (res.status === 404) throw new PlatformError("not_found", `@${username} was not found on Instagram`, 404);
    if (res.status === 200 && res.text.startsWith("{")) {
      const parsed = parseWebProfile(JSON.parse(res.text));
      if (!parsed) throw new PlatformError("not_found", `@${username} was not found on Instagram`, 404);
      return parsed;
    }
  }
  throw new PlatformError(
    "blocked",
    `Instagram is limiting anonymous requests from this server (HTTP ${lastStatus}). Try again shortly.`,
    503,
  );
}

export const instagram: PlatformAdapter = {
  platform: "instagram",

  async getProfile(username): Promise<Profile> {
    return (await webProfile(username)).profile;
  },

  async getPosts(username, opts): Promise<Post[]> {
    const { profile, posts } = await webProfile(username);
    if (profile.isPrivate) throw new PlatformError("private_account", "This account is private", 403);
    return posts.slice(0, opts?.limit ?? 12);
  },

  async getPost(idOrUrl): Promise<Post> {
    const { shortcode } = parseInstagramRef(idOrUrl);
    if (!shortcode) throw new PlatformError("invalid_input", "Paste a valid Instagram post or reel link", 400);
    const res = await httpGet(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, { retries: 1 });
    if (res.status === 404) throw new PlatformError("not_found", "Post not found or not public", 404);
    const post = parseEmbedHtml(res.text, shortcode);
    if (!post) throw new PlatformError("blocked", "Instagram did not return this post's media. It may be private or rate-limited.", 503);
    return post;
  },

  async getStories(username): Promise<Story[]> {
    if (!env.igSessionId) {
      throw new PlatformError("blocked", "Public story viewing requires the server's IG_SESSIONID to be configured.", 503);
    }
    const { profile } = await webProfile(username);
    if (profile.isPrivate) throw new PlatformError("private_account", "Stories of private accounts are not available", 403);
    const res = await httpGet(`https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=${profile.id}`, { headers: igHeaders(), retries: 0 });
    if (res.status !== 200) throw new PlatformError("blocked", `Instagram refused the story request (HTTP ${res.status})`, 503);
    return parseReelsMedia(JSON.parse(res.text), profile.username);
  },

  async getConnections(): Promise<ConnectionsResult> {
    // Instagram only exposes follower lists to logged-in users; we do not bypass that.
    return { available: false, reason: "private_api", items: [] };
  },
};
