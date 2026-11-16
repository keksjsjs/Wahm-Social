/** Decide, per account, whether its followers/following list may be shown. */
import type { ConnectionsResult, Profile } from "../types";

export function visibilityOf(profile: Profile, kind: "followers" | "following"): ConnectionsResult["visibility"] {
  if (profile.isPrivate) return "private";
  if (profile.platform === "tiktok" && kind === "following" && profile.followingVisibility !== undefined) {
    return profile.followingVisibility === 1 ? "public" : "hidden";
  }
  return "public";
}

export function listUrl(profile: Profile, kind: "followers" | "following"): string {
  return profile.platform === "tiktok" ? `${profile.profileUrl}` : `https://www.instagram.com/${profile.username}/${kind}/`;
}

export function lockedResult(profile: Profile, kind: "followers" | "following", reason: ConnectionsResult["reason"]): ConnectionsResult {
  return {
    available: false,
    reason,
    visibility: visibilityOf(profile, kind),
    total: kind === "followers" ? profile.followers : profile.following,
    items: [],
    platformUrl: listUrl(profile, kind),
  };
}
