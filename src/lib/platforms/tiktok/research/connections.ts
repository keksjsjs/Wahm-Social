import "server-only";
/**
 * Followers / following via the official TikTok Research API.
 * TikTok itself enforces account privacy here: private accounts and hidden
 * lists return errors, which we map to locked states.
 */
import type { Connection } from "../../types";
import { PlatformError } from "../../types";
import { researchToken } from "./token";

interface ResearchUser {
  display_name?: string;
  username?: string;
}

export async function researchConnections(
  username: string,
  kind: "followers" | "following",
  cursor?: string,
): Promise<{ items: Connection[]; nextCursor: string | null }> {
  const token = await researchToken();
  const endpoint = kind === "followers" ? "followers" : "following";
  const body: Record<string, unknown> = { username, max_count: 100 };
  if (cursor) body.cursor = Number(cursor);
  const res = await fetch(`https://open.tiktokapis.com/v2/research/user/${endpoint}/`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = (await res.json()) as {
    data?: { user_followers?: ResearchUser[]; user_following?: ResearchUser[]; cursor?: number; has_more?: boolean };
    error?: { code?: string; message?: string };
  };
  if (j.error?.code && j.error.code !== "ok") {
    const msg = j.error.message ?? j.error.code;
    if (/private|permission|not.?public/i.test(msg)) throw new PlatformError("private_account", msg, 403);
    throw new PlatformError("upstream_error", msg, 502);
  }
  const list = (kind === "followers" ? j.data?.user_followers : j.data?.user_following) ?? [];
  return {
    items: list
      .filter((u) => u.username)
      .map((u) => ({ username: u.username!, displayName: u.display_name || u.username!, avatarUrl: "", verified: false })),
    nextCursor: j.data?.has_more && j.data.cursor !== undefined ? String(j.data.cursor) : null,
  };
}
