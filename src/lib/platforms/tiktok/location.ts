import "server-only";
/**
 * Account location for a public TikTok profile, from its own public videos:
 * each video page carries `locationCreated` (country it was posted from) and an
 * optional tagged place. We sample the latest few videos.
 */
import type { Post, ProfileLocation } from "../types";
import { summarizeLocation } from "./location-summary";
import { mapLimit } from "../../server/concurrency";
import { fetchEmbed, fetchVideoPage } from "./adapter";

export async function accountLocation(username: string, language?: string, sample = 3): Promise<ProfileLocation | undefined> {
  const { posts } = await fetchEmbed(username);
  const ids = posts.slice(0, sample).filter((p) => /^\d+$/.test(p.id));
  const detailed = await mapLimit(ids, 3, async (p) => {
    try {
      return (await fetchVideoPage(username, p.id)).post;
    } catch {
      return null;
    }
  });
  return summarizeLocation(detailed.filter((p): p is Post => !!p), language);
}
