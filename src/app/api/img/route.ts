/** Image proxy (avoids hotlink/CORP blocks on platform CDNs). Allow-listed hosts only. */
import { PlatformError } from "@/lib/platforms/types";
import { fail } from "@/lib/server/respond";
import { fetchMedia, streamResponse } from "@/lib/server/media";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const u = new URL(req.url).searchParams.get("u");
    if (!u) throw new PlatformError("invalid_input", "Missing url", 400);
    const upstream = await fetchMedia(u);
    const type = upstream.headers.get("content-type") ?? "";
    if (!/^(image|video)\//.test(type)) throw new PlatformError("invalid_input", "Not an image", 400);
    return streamResponse(upstream, { cacheSeconds: 3600 });
  } catch (e) {
    return fail(e);
  }
}
