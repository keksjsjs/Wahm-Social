import "server-only";
/**
 * Platform service: the only entry point UI/API code should use.
 * Adds caching, demo fallback, and source labelling on top of raw adapters.
 */
import { env } from "../env";
import { cached, TTL } from "../server/cache";
import { instagram } from "./instagram/adapter";
import { tiktok } from "./tiktok/adapter";
import { demoPosts, demoProfile, demoStories } from "./demo";
import { connectionsFor } from "./connections";
import { lockedResult } from "./connections/visibility";
import { PlatformError, type ConnectionsResult, type DataSource, type Platform, type PlatformAdapter, type Post, type Profile, type Story } from "./types";

export * from "./types";

const adapters: Record<Platform, PlatformAdapter> = { tiktok, instagram };
export const adapter = (p: Platform) => adapters[p];

export interface Sourced<T> {
  data: T;
  source: DataSource;
  notice?: string;
}

const DEMO_NOTICE =
  "المنصة تحجب الطلبات من السيرفر حالياً — نعرض بيانات تجريبية. Platform is blocking server requests right now; showing demo data.";

async function withFallback<T>(key: string, ttl: number, live: () => Promise<T>, demo: () => T): Promise<Sourced<T>> {
  if (env.demoMode === "on") return { data: demo(), source: "demo", notice: DEMO_NOTICE };
  try {
    const [data, fromCache] = await cached(key, ttl, live);
    return { data, source: fromCache ? "cache" : "live" };
  } catch (e) {
    if (env.demoMode === "auto" && e instanceof PlatformError && (e.code === "blocked" || e.code === "upstream_error")) {
      return { data: demo(), source: "demo", notice: DEMO_NOTICE };
    }
    throw e;
  }
}

export function getProfile(platform: Platform, username: string): Promise<Sourced<Profile>> {
  return withFallback(`profile:${platform}:${username}`, TTL.profile, () => adapters[platform].getProfile(username), () => demoProfile(platform, username));
}

const IG_POSTS_NOTICE =
  "انستقرام يحد عرض المنشورات من السيرفر حالياً — نعرض معلومات الحساب العامة فقط. الصق رابط أي منشور في مركز التحميل لتحميله. Instagram is limiting post listings from our server; showing the public profile only — paste a post link in the Download center to save it.";

export async function getPosts(platform: Platform, username: string, limit = 12): Promise<Sourced<Post[]>> {
  if (platform === "instagram" && env.demoMode !== "on") {
    try {
      const [data, fromCache] = await cached(`posts:${platform}:${username}:${limit}`, TTL.posts, () => adapters.instagram.getPosts(username, { limit }));
      return { data, source: fromCache ? "cache" : "live" };
    } catch (e) {
      if (!(e instanceof PlatformError) || (e.code !== "blocked" && e.code !== "upstream_error")) throw e;
      const prof = await getProfile(platform, username).catch(() => null);
      if (prof && prof.source !== "demo") return { data: [], source: "live", notice: IG_POSTS_NOTICE };
      return { data: demoPosts(platform, username, limit), source: "demo", notice: DEMO_NOTICE };
    }
  }
  return withFallback(
    `posts:${platform}:${username}:${limit}`,
    TTL.posts,
    async () => {
      const posts = await adapters[platform].getPosts(username, { limit });
      return platform === "tiktok" ? tiktok.enrich(posts, Math.min(limit, 12)) : posts;
    },
    () => demoPosts(platform, username, limit),
  );
}

export async function getPost(platform: Platform, ref: string, username?: string): Promise<Sourced<Post>> {
  const [data, fromCache] = await cached(`post:${platform}:${ref}`, TTL.post, () => adapters[platform].getPost(ref, username));
  return { data, source: fromCache ? "cache" : "live" };
}

export function getStories(platform: Platform, username: string): Promise<Sourced<Story[]>> {
  return withFallback(`stories:${platform}:${username}`, TTL.stories, () => adapters[platform].getStories(username), () => demoStories(platform, username));
}

/** Followers/following honouring each account's own privacy (see connections/index.ts). */
export async function getConnections(platform: Platform, username: string, kind: "followers" | "following", cursor?: string): Promise<Sourced<ConnectionsResult>> {
  const p = await getProfile(platform, username);
  if (p.source === "demo") return { data: lockedResult(p.data, kind, "not_supported"), source: "demo", notice: p.notice };
  return { data: await connectionsFor(p.data, kind, cursor), source: "live" };
}

/** Detect platform from a pasted URL. */
export function detectPlatform(input: string): Platform | null {
  if (/tiktok\.com/i.test(input)) return "tiktok";
  if (/instagram\.com|instagr\.am/i.test(input)) return "instagram";
  return null;
}
