import "server-only";
/**
 * Connections service: privacy gate → provider → cached result.
 * Order of checks (per account):
 *  1. Account private            → locked ("account_private")
 *  2. List hidden by the owner   → locked ("hidden_by_user")
 *  3. Provider available         → real list (TikTok Research API)
 *  4. Otherwise                  → public-but-unavailable state with counts + deep link
 */
import { tiktokResearch } from "../../env";
import { cached } from "../../server/cache";
import { PlatformError, type ConnectionsResult, type Platform, type Profile } from "../types";
import { researchConnections } from "../tiktok/research/connections";
import { lockedResult, listUrl, visibilityOf } from "./visibility";

export async function connectionsFor(profile: Profile, kind: "followers" | "following", cursor?: string): Promise<ConnectionsResult> {
  const vis = visibilityOf(profile, kind);
  if (vis === "private") return lockedResult(profile, kind, "account_private");
  if (vis === "hidden") return lockedResult(profile, kind, "hidden_by_user");

  if (profile.platform === "tiktok" && tiktokResearch.enabled) {
    try {
      const [r] = await cached(`conn:${profile.platform}:${profile.username}:${kind}:${cursor ?? 0}`, 30 * 60_000, () =>
        researchConnections(profile.username, kind, cursor),
      );
      return {
        available: true,
        visibility: "public",
        total: kind === "followers" ? profile.followers : profile.following,
        items: r.items,
        nextCursor: r.nextCursor,
        provider: "tiktok-research-api",
        platformUrl: listUrl(profile, kind),
      };
    } catch (e) {
      if (e instanceof PlatformError && e.code === "private_account") return lockedResult(profile, kind, "hidden_by_user");
      // fall through to public-but-unavailable state
    }
  }
  return lockedResult(profile, kind, profile.platform === "instagram" ? "login_only" : "provider_required");
}

export function providerStatus(platform: Platform) {
  return platform === "tiktok" ? (tiktokResearch.enabled ? "tiktok-research-api" : null) : null;
}
