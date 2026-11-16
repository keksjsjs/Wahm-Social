import "server-only";
import { platformEnabled } from "../site/flags";
/**
 * Request-scoped data loaders for server components. `cache()` de-duplicates
 * calls between generateMetadata, layouts and pages within one request.
 */
import { cache } from "react";
import { getPosts, getProfile, getStories, type Sourced } from "../platforms";
import { isPlatform, PlatformError, type Platform, type Post, type Profile, type Story } from "../platforms/types";
import { isValidUsername, normalizeUsername } from "../format";
import { Searches } from "./db";

export type Loaded<T> = { ok: true; value: Sourced<T> } | { ok: false; code: PlatformError["code"]; message: string };

async function wrap<T>(fn: () => Promise<Sourced<T>>): Promise<Loaded<T>> {
  try {
    return { ok: true, value: await fn() };
  } catch (e) {
    if (e instanceof PlatformError) return { ok: false, code: e.code, message: e.message };
    console.error("[loader]", e);
    return { ok: false, code: "internal", message: "Unexpected error" };
  }
}

export function parseRoute(platform: string, username: string): { platform: Platform; username: string } | null {
  if (!isPlatform(platform) || !platformEnabled(platform)) return null;
  const u = normalizeUsername(username);
  if (!isValidUsername(u)) return null;
  return { platform, username: u };
}

export const loadProfile = cache(async (platform: Platform, username: string): Promise<Loaded<Profile>> => {
  const r = await wrap(() => getProfile(platform, username));
  if (r.ok && r.value.source !== "demo") Searches.log(platform, username);
  return r;
});

export const loadPosts = cache((platform: Platform, username: string, limit = 12): Promise<Loaded<Post[]>> => wrap(() => getPosts(platform, username, limit)));

export const loadStories = cache((platform: Platform, username: string): Promise<Loaded<Story[]>> => wrap(() => getStories(platform, username)));
