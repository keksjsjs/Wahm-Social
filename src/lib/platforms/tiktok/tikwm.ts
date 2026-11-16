import "server-only";
/**
 * Public tikwm.com fallbacks: profile, stories, watermark-free video.
 * Requests go through SCRAPER_PROXY when it is set. Cloudflare/HTML
 * challenges are recorded as `tikwm_blocked` — never treated as data.
 */
import { httpGet } from "../../server/http";
import type { Post, Profile, Story } from "../types";
import { parseJsonBody, thirdPartyBlocked } from "./fallback-http";
import { mediaFromTikwm, postFromTikwm, profileFromTikwm, storiesFromTikwm, unwrapTikwm, type TikwmVideoMedia } from "./tikwm-parse";

export type TikwmNote = "ok" | "tikwm_blocked" | "tikwm_empty" | "tikwm_not_found" | "tikwm_error";

export interface TikwmTry {
  at: string;
  endpoint: string;
  note: TikwmNote;
  status?: number;
}

let lastTry: TikwmTry | null = null;
let lastStoriesNote: TikwmNote | undefined;
export const tikwmTry = () => lastTry;
export const tikwmStoriesNote = () => lastStoriesNote;

function record(endpoint: string, note: TikwmNote, status?: number) {
  lastTry = { at: new Date().toISOString(), endpoint, note, status };
}

const BASE = "https://www.tikwm.com";
const HEADERS = {
  accept: "application/json, text/plain, */*",
  referer: "https://www.tikwm.com/",
};

async function tikwmGet(path: string, endpoint: string): Promise<{ ok: true; data: unknown } | { ok: false; note: TikwmNote }> {
  try {
    const res = await httpGet(`${BASE}${path}`, {
      proxy: true,
      retries: 0,
      timeoutMs: 15000,
      headers: HEADERS,
    });
    if (thirdPartyBlocked(res.status, res.text, res.headers) || res.status === 403 || res.status === 429) {
      record(endpoint, "tikwm_blocked", res.status);
      return { ok: false, note: "tikwm_blocked" };
    }
    const json = parseJsonBody(res.text);
    if (!json) {
      const note: TikwmNote = res.status >= 400 ? "tikwm_error" : "tikwm_blocked";
      record(endpoint, note, res.status);
      return { ok: false, note };
    }
    const unwrapped = unwrapTikwm(json);
    if (!unwrapped.ok) {
      const note: TikwmNote = unwrapped.notFound ? "tikwm_not_found" : "tikwm_empty";
      record(endpoint, note, res.status);
      return { ok: false, note };
    }
    record(endpoint, "ok", res.status);
    return { ok: true, data: unwrapped.data };
  } catch {
    record(endpoint, "tikwm_error");
    return { ok: false, note: "tikwm_error" };
  }
}

export async function tikwmUser(username: string): Promise<{ ok: true; data: Profile } | { ok: false; note: TikwmNote }> {
  const r = await tikwmGet(`/api/user/info?unique_id=${encodeURIComponent(username)}`, "user_info");
  if (!r.ok) return r;
  const profile = profileFromTikwm(r.data);
  if (!profile) {
    record("user_info", "tikwm_empty");
    return { ok: false, note: "tikwm_empty" };
  }
  return { ok: true, data: profile };
}

export async function tikwmStories(username: string): Promise<{ ok: true; data: Story[] } | { ok: false; note: TikwmNote }> {
  const r = await tikwmGet(`/api/user/story?unique_id=${encodeURIComponent(username)}`, "user_story");
  lastStoriesNote = r.ok ? "ok" : r.note;
  if (!r.ok) return r;
  return { ok: true, data: storiesFromTikwm(r.data, username) };
}

async function tikwmVideoGet(url: string): Promise<{ ok: true; data: unknown } | { ok: false; note: TikwmNote }> {
  return tikwmGet(`/api/?url=${encodeURIComponent(url)}&hd=1`, "video");
}

async function tikwmVideoPost(url: string): Promise<{ ok: true; data: unknown } | { ok: false; note: TikwmNote }> {
  try {
    const res = await httpGet(`${BASE}/api/`, {
      method: "POST",
      body: `url=${encodeURIComponent(url)}&hd=1`,
      proxy: true,
      retries: 0,
      timeoutMs: 20000,
      headers: { ...HEADERS, "content-type": "application/x-www-form-urlencoded" },
    });
    if (thirdPartyBlocked(res.status, res.text, res.headers) || res.status === 403 || res.status === 429) {
      record("video_post", "tikwm_blocked", res.status);
      return { ok: false, note: "tikwm_blocked" };
    }
    const json = parseJsonBody(res.text);
    if (!json) {
      record("video_post", "tikwm_error", res.status);
      return { ok: false, note: "tikwm_error" };
    }
    const unwrapped = unwrapTikwm(json);
    if (!unwrapped.ok) {
      record("video_post", unwrapped.notFound ? "tikwm_not_found" : "tikwm_empty", res.status);
      return { ok: false, note: unwrapped.notFound ? "tikwm_not_found" : "tikwm_empty" };
    }
    record("video_post", "ok", res.status);
    return { ok: true, data: unwrapped.data };
  } catch {
    record("video_post", "tikwm_error");
    return { ok: false, note: "tikwm_error" };
  }
}

export async function tikwmVideo(url: string): Promise<{ ok: true; data: TikwmVideoMedia } | { ok: false; note: TikwmNote }> {
  let r = await tikwmVideoGet(url);
  if (!r.ok) r = await tikwmVideoPost(url);
  if (!r.ok) return r;
  const media = mediaFromTikwm(r.data);
  if (!media) {
    record(lastTry?.endpoint ?? "video", "tikwm_empty");
    return { ok: false, note: "tikwm_empty" };
  }
  return { ok: true, data: media };
}

export async function tikwmPost(url: string, username?: string): Promise<{ ok: true; data: Post } | { ok: false; note: TikwmNote }> {
  let r = await tikwmVideoGet(url);
  if (!r.ok) r = await tikwmVideoPost(url);
  if (!r.ok) return r;
  const post = postFromTikwm(r.data, username);
  if (!post) {
    record(lastTry?.endpoint ?? "video", "tikwm_empty");
    return { ok: false, note: "tikwm_empty" };
  }
  return { ok: true, data: post };
}
