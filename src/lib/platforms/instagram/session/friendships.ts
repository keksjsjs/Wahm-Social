import "server-only";
/**
 * Followers / following of a PUBLIC Instagram account, read with the server's own
 * signed-in session — the same list any logged-in visitor sees on instagram.com.
 * Private accounts never reach this function (the privacy gate runs first).
 */
import type { Connection } from "../../types";
import { PlatformError } from "../../types";
import { igJson } from "./api";
import { hasSession } from "./cookies";
import { recordIg } from "./diagnostics";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function igFriendships(userId: string, username: string, kind: "followers" | "following", count = 12): Promise<Connection[]> {
  if (!hasSession() || !/^\d+$/.test(userId)) throw new PlatformError("blocked", "Instagram session not available", 503);
  const qs = kind === "followers" ? `count=${count}&search_surface=follow_list_page` : `count=${count}`;
  const r = await igJson(
    `https://www.instagram.com/api/v1/friendships/${userId}/${kind}/?${qs}`,
    "web-session",
    `https://www.instagram.com/${username}/${kind}/`,
  );
  if (!r.ok) {
    recordIg(username, [r.attempt], `${kind}_blocked`);
    throw new PlatformError("blocked", "Instagram refused the list request", 503);
  }
  const users: any[] = r.json?.users ?? [];
  return users
    .filter((u) => u?.username)
    .map((u) => ({ username: u.username, displayName: u.full_name || u.username, avatarUrl: u.profile_pic_url || "", verified: !!u.is_verified }));
}
