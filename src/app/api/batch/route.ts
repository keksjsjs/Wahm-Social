/**
 * Batch download (Pro). Returns a manifest of per-item download URLs; the
 * client downloads them sequentially so the server never buffers big ZIPs.
 */
import { z } from "zod";
import { detectPlatform, getPost, getPosts } from "@/lib/platforms";
import { PlatformError, type Post } from "@/lib/platforms/types";
import { requireFeature } from "@/lib/server/auth";
import { handler, ok } from "@/lib/server/respond";
import { planOf } from "@/lib/plans";
import { normalizeUsername, isValidUsername } from "@/lib/format";
import { mapLimit } from "@/lib/server/concurrency";

const Body = z.object({
  platform: z.enum(["tiktok", "instagram"]).optional(),
  username: z.string().optional(),
  urls: z.array(z.string()).optional(),
});

function downloadUrl(p: Post, i = 0) {
  const ref = p.platform === "tiktok" ? p.id : p.shortcode ?? p.id;
  return `/api/download?platform=${p.platform}&ref=${encodeURIComponent(ref)}&u=${encodeURIComponent(p.author)}&i=${i}`;
}

export const POST = handler(async (req: Request) => {
  const user = await requireFeature("batch_download");
  const max = planOf(user.plan).batchSize;
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) throw new PlatformError("invalid_input", "Invalid request", 400);
  let posts: Post[] = [];
  let source: "live" | "cache" | "demo" = "live";
  if (body.data.username && body.data.platform) {
    const u = normalizeUsername(body.data.username);
    if (!isValidUsername(u)) throw new PlatformError("invalid_input", "Invalid username", 400);
    const r = await getPosts(body.data.platform, u, Math.min(max, 30));
    posts = r.data;
    source = r.source;
  } else if (body.data.urls?.length) {
    const urls = body.data.urls.map((s) => s.trim()).filter(Boolean).slice(0, max);
    const results = await mapLimit(urls, 3, async (url) => {
      const pl = detectPlatform(url);
      if (!pl) return null;
      try {
        return (await getPost(pl, url)).data;
      } catch {
        return null;
      }
    });
    posts = results.filter((p): p is Post => !!p);
  } else throw new PlatformError("invalid_input", "Provide a username or a list of links", 400);

  const items = posts.flatMap((p) =>
    (p.media.length ? p.media : [{ type: "image" as const, url: p.cover }]).map((m, i) => ({
      id: p.id,
      author: p.author,
      type: m.type,
      cover: p.cover,
      caption: p.caption.slice(0, 120),
      download: source === "demo" ? null : downloadUrl(p, i),
    })),
  );
  return ok({ count: items.length, limit: max, items }, source);
});
