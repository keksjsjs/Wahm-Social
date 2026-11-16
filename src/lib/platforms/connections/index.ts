import "server-only";
/**
 * Connections service: privacy gate → provider → cached result.
 * Order of checks (per account):
 *  1. Account private            → locked ("account_private")
 *  2. List hidden by the owner   → locked ("hidden_by_user")
 *  3. Official / session provider → real list (TikTok Research API, Instagram server session)
 *  4. Otherwise                  → counts + deep link, plus (TikTok followers) the newest
 *                                  public commenters, clearly labelled as such
 */
import { tiktokResearch } from "../../env";
import { cached } from "../../server/cache";
import { PlatformError, type ConnectionsResult, type Platform, type Profile } from "../types";
import { researchConnections } from "../tiktok/research/connections";
import { recentFans } from "../tiktok/fans";
import { igFriendships } from "../instagram/session/friendships";
import { hasSession } from "../instagram/session/cookies";
import { lockedResult, listUrl, visibilityOf } from "./visibility";

const TTL = 30 * 60_000;
let lastResearchError: string | null = null;
/** Last TikTok Research API error message (no secrets), for /api/health?ig=1. */
export const researchStatus = () => (tiktokResearch.enabled ? lastResearchError ?? "configured" : "not_configured");

export async function connectionsFor(profile: Profile, kind: "followers" | "following", cursor?: string): Promise<ConnectionsResult> {
  const vis = visibilityOf(profile, kind);
  if (vis === "private") return lockedResult(profile, kind, "account_private");
  if (vis === "hidden") return lockedResult(profile, kind, "hidden_by_user");
  const total = kind === "followers" ? profile.followers : profile.following;
  const key = `conn:${profile.platform}:${profile.username}:${kind}`;

  if (profile.platform === "tiktok" && tiktokResearch.enabled) {
    try {
      const [r] = await cached(`${key}:${cursor ?? 0}`, TTL, () => researchConnections(profile.username, kind, cursor));
      return { available: true, visibility: "public", total, items: r.items, nextCursor: r.nextCursor, provider: "tiktok-research-api", platformUrl: listUrl(profile, kind) };
    } catch (e) {
      lastResearchError = (e as Error).message?.slice(0, 160) ?? "error";
      if (e instanceof PlatformError && e.code === "private_account") return lockedResult(profile, kind, "hidden_by_user");
      // Research API not granted for these keys → fall through
    }
  }

  if (profile.platform === "instagram" && hasSession() && /^\d+$/.test(profile.id)) {
    try {
      const [items] = await cached(key, TTL, () => igFriendships(profile.id, profile.username, kind));
      if (items.length) {
        return { available: true, visibility: "public", total, items: items.slice(0, 12), provider: "instagram-session", platformUrl: listUrl(profile, kind) };
      }
    } catch {
      // session refused → locked state below
    }
  }

  const base = lockedResult(profile, kind, profile.platform === "instagram" ? "login_only" : "provider_required");
  if (profile.platform === "tiktok" && kind === "followers") {
    try {
      const [fans] = await cached(`${key}:fans`, 10 * 60_000, () => recentFans(profile.username, 5));
      if (fans.length) base.related = { kind: "recent_commenters", items: fans };
    } catch {
      // no related accounts available
    }
  }
  return base;
}

export function providerStatus(platform: Platform) {
  if (platform === "tiktok") return tiktokResearch.enabled ? "tiktok-research-api" : null;
  return hasSession() ? "instagram-session" : null;
}
