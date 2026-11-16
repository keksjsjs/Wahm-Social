/** Inline media streaming for in-page playback (supports HTTP Range). Not quota-counted. */
import { isPlatform, PlatformError } from "@/lib/platforms/types";
import { burstGuard } from "@/lib/server/guard";
import { fail } from "@/lib/server/respond";
import { fetchMedia, streamResponse } from "@/lib/server/media";
import { resolveMedia } from "@/lib/server/resolveMedia";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    burstGuard(req, "stream", 120);
    const sp = new URL(req.url).searchParams;
    const platform = sp.get("platform") ?? "";
    const ref = sp.get("ref") ?? "";
    if (!isPlatform(platform) || !ref) throw new PlatformError("invalid_input", "Missing platform or ref", 400);
    const m = await resolveMedia(platform, ref, { author: sp.get("u") ?? undefined, index: Number(sp.get("i") ?? 0), kind: sp.get("kind") ?? undefined });
    const upstream = await fetchMedia(m.url, { cookie: m.cookie, range: req.headers.get("range") });
    return streamResponse(upstream, { filename: m.filename, inline: true });
  } catch (e) {
    return fail(e);
  }
}
