/** Download-center resolver: accepts any public TikTok/Instagram post URL. */
import { detectPlatform, getPost } from "@/lib/platforms";
import { PlatformError } from "@/lib/platforms/types";
import { burstGuard } from "@/lib/server/guard";
import { handler, ok } from "@/lib/server/respond";

export const dynamic = "force-dynamic";

export const GET = handler(async (req: Request) => {
  burstGuard(req);
  const url = (new URL(req.url).searchParams.get("url") ?? "").trim();
  if (!url) throw new PlatformError("invalid_input", "Paste a link first", 400);
  const platform = detectPlatform(url);
  if (!platform) throw new PlatformError("invalid_input", "Only TikTok and Instagram links are supported", 400);
  const r = await getPost(platform, url);
  return ok({ platform, post: r.data }, r.source);
});
