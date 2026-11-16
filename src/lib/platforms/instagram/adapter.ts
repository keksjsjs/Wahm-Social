import "server-only";
/**
 * Instagram adapter — public endpoints only.
 *  - /api/v1/users/web_profile_info/?username=  (public profile + 12 recent posts)
 *  - /p/{shortcode}/embed/captioned/              (public post media)
 *  - /api/v1/feed/reels_media/                    (public stories; needs IG_SESSIONID)
 * Instagram aggressively rate-limits datacenter IPs. Configure IG_SESSIONID
 * and/or SCRAPER_PROXY for production reliability. Private accounts are never
 * bypassed: their content is reported as locked.
 */
import { httpGet } from "../../server/http";
import { hasSession, type IgClient } from "./session/cookies";
import { igJson, type IgAttempt } from "./session/api";
import { recordIg } from "./session/diagnostics";
import { PlatformError, type PlatformAdapter, type Post, type Profile, type Story } from "../types";
import { parseEmbedHtml, parseInstagramRef, parseReelsMedia, parseWebProfile } from "./parser";
import { fetchPreview } from "./preview/fetch";
import { parseOgPost, parseOgProfile } from "./preview/parse";

type WebProfile = NonNullable<ReturnType<typeof parseWebProfile>>;
type Lookup = { found: WebProfile } | { missing: true; attempts: IgAttempt[] } | { blocked: true; attempts: IgAttempt[] };

/** Try every configured client in order: session (web), session (app API), anonymous. */
async function lookup(username: string): Promise<Lookup> {
  const q = encodeURIComponent(username);
  const plan: [string, IgClient][] = [];
  if (hasSession()) {
    plan.push([`https://www.instagram.com/api/v1/users/web_profile_info/?username=${q}`, "web-session"]);
    plan.push([`https://i.instagram.com/api/v1/users/web_profile_info/?username=${q}`, "app-session"]);
  }
  plan.push([`https://www.instagram.com/api/v1/users/web_profile_info/?username=${q}`, "web-anon"]);
  const attempts: IgAttempt[] = [];
  let sawEmpty = false;
  for (const [url, client] of plan) {
    const r = await igJson(url, client, `https://www.instagram.com/${q}/`);
    attempts.push(r.attempt);
    if (!r.ok) continue;
    const parsed = parseWebProfile(r.json);
    if (parsed) {
      recordIg(username, attempts, "ok");
      return { found: parsed };
    }
    r.attempt.outcome = "empty";
    sawEmpty = true;
  }
  return sawEmpty ? { missing: true, attempts } : { blocked: true, attempts };
}

async function webProfile(username: string): Promise<WebProfile> {
  const r = await lookup(username);
  if ("found" in r) return r.found;
  recordIg(username, r.attempts, "missing" in r ? "empty" : "blocked");
  if ("missing" in r) throw new PlatformError("not_found", `@${username} was not found on Instagram`, 404);
  throw new PlatformError(
    "blocked",
    hasSession()
      ? "Instagram rejected the server session (it may have expired or needs a security check). Showing what the public preview allows."
      : "Instagram is limiting anonymous requests from this server. Try again shortly.",
    503,
  );
}

/**
 * Public link-preview profile (name, avatar, counts). It sometimes comes back bare
 * under load, so retry; "missing" only when every attempt returned a page without a profile.
 */
async function previewProfile(username: string): Promise<Profile | "missing" | null> {
  let bare = 0;
  for (let i = 0; i < 3; i++) {
    if (i) await new Promise((r) => setTimeout(r, 500 * i));
    try {
      const p = parseOgProfile(await fetchPreview(`/${encodeURIComponent(username)}/`, i), username);
      if (p) return p;
      bare++;
    } catch (e) {
      if (e instanceof PlatformError && e.code === "not_found") return "missing";
    }
  }
  return bare === 3 ? "missing" : null;
}

/** Last good profile per username — served when Instagram temporarily blocks the server. */
const lastGood = new Map<string, { profile: Profile; at: number }>();
const remember = (p: Profile) => {
  lastGood.set(p.username.toLowerCase(), { profile: p, at: Date.now() });
  if (lastGood.size > 2000) lastGood.delete(lastGood.keys().next().value as string);
  return p;
};

export const instagram: PlatformAdapter = {
  platform: "instagram",

  async getProfile(username): Promise<Profile> {
    const r = await lookup(username);
    if ("found" in r) return remember(r.found.profile);
    // API refused or said "empty": the public preview is the tie-breaker before we call it missing.
    const p = await previewProfile(username);
    recordIg(username, r.attempts, p && p !== "missing" ? "preview" : p === "missing" || "missing" in r ? "empty" : "blocked");
    if (p && p !== "missing") return remember(p);
    const stale = lastGood.get(username.toLowerCase());
    if (p !== "missing" && stale && Date.now() - stale.at < 24 * 3600_000) return stale.profile;
    if (p === "missing" || "missing" in r) throw new PlatformError("not_found", `@${username} was not found on Instagram`, 404);
    throw new PlatformError("blocked", "Instagram is temporarily refusing lookups from this server. Please try again in a minute.", 503);
  },

  async getPosts(username, opts): Promise<Post[]> {
    const { profile, posts } = await webProfile(username);
    if (profile.isPrivate) throw new PlatformError("private_account", "This account is private", 403);
    return posts.slice(0, opts?.limit ?? 12);
  },

  async getPost(idOrUrl): Promise<Post> {
    const { shortcode } = parseInstagramRef(idOrUrl);
    if (!shortcode) throw new PlatformError("invalid_input", "Paste a valid Instagram post or reel link", 400);
    const res = await httpGet(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, { retries: 0, proxy: true });
    if (res.status === 404) throw new PlatformError("not_found", "Post not found or not public", 404);
    const post = parseEmbedHtml(res.text, shortcode);
    if (post) return post;
    // Fallback: public link-preview (cover image / video, likes, caption).
    let preview = null as ReturnType<typeof parseOgPost>;
    for (let i = 0; i < 3 && !preview; i++) {
      try {
        preview = parseOgPost(await fetchPreview(`/p/${shortcode}/`, i), shortcode);
      } catch (e) {
        if (e instanceof PlatformError && e.code === "not_found") throw e;
      }
    }
    if (!preview) throw new PlatformError("blocked", "Instagram did not return this post's media. It may be private or rate-limited.", 503);
    return preview;
  },

  async getStories(username): Promise<Story[]> {
    if (!hasSession()) {
      throw new PlatformError("blocked", "Public story viewing requires the server's IG_SESSIONID to be configured.", 503);
    }
    const { profile } = await webProfile(username);
    if (profile.isPrivate) throw new PlatformError("private_account", "Stories of private accounts are not available", 403);
    const tries: [string, IgClient][] = [
      [`https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=${profile.id}`, "web-session"],
      [`https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=${profile.id}`, "app-session"],
    ];
    const attempts: IgAttempt[] = [];
    for (const [url, client] of tries) {
      const r = await igJson(url, client, `https://www.instagram.com/stories/${profile.username}/`);
      attempts.push(r.attempt);
      if (r.ok) return parseReelsMedia(r.json, profile.username);
    }
    recordIg(username, attempts, "stories_blocked");
    throw new PlatformError("blocked", "Instagram refused the story request — the server session may need re-login.", 503);
  },
};
