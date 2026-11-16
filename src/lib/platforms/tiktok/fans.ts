import "server-only";
/**
 * "Recently active fans" for a public TikTok account: the newest commenters on
 * its latest public videos. TikTok's follower list itself needs signed requests
 * (or the Research API), so this is shown clearly labelled as commenters —
 * never presented as the follower list.
 */
import type { Connection } from "../types";
import { httpGet, DESKTOP_UA } from "../../server/http";
import { fetchEmbed } from "./adapter";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function commentsOf(videoId: string, author: string): Promise<Connection[]> {
  const res = await httpGet(`https://www.tiktok.com/api/comment/list/?aid=1988&aweme_id=${videoId}&count=50&cursor=0`, {
    headers: { "user-agent": DESKTOP_UA, referer: `https://www.tiktok.com/@${author}/video/${videoId}`, accept: "application/json" },
    retries: 1,
    timeoutMs: 8000,
  });
  if (res.status !== 200 || !res.text.startsWith("{")) return [];
  const comments: any[] = JSON.parse(res.text)?.comments ?? [];
  return comments
    .filter((c) => c?.user?.unique_id && c.user.unique_id.toLowerCase() !== author.toLowerCase())
    .map((c) => ({
      username: c.user.unique_id,
      displayName: c.user.nickname || c.user.unique_id,
      avatarUrl: c.user.avatar_thumb?.url_list?.[0] ?? "",
      verified: Boolean(c.user.custom_verify || c.user.enterprise_verify_reason),
      activeAt: Number(c.create_time) || undefined,
      note: String(c.text ?? "").slice(0, 90),
    }));
}

export async function recentFans(username: string, limit = 5): Promise<Connection[]> {
  const { posts } = await fetchEmbed(username);
  const ids = posts.slice(0, 3).map((p) => p.id).filter((id) => /^\d+$/.test(id));
  const lists = await Promise.all(ids.map((id) => commentsOf(id, username).catch(() => [] as Connection[])));
  const seen = new Set<string>();
  return lists
    .flat()
    .sort((a, b) => (b.activeAt ?? 0) - (a.activeAt ?? 0))
    .filter((c) => (seen.has(c.username) ? false : (seen.add(c.username), true)))
    .slice(0, limit);
}
