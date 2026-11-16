/**
 * Streams a public media file as an attachment.
 *   /api/download?platform=tiktok&ref=<id|url>&u=<author>&i=0&kind=audio
 * Counts against the daily download quota.
 */
import { isPlatform, PlatformError } from "@/lib/platforms/types";
import { burstGuard } from "@/lib/server/guard";
import { fail } from "@/lib/server/respond";
import { fetchMedia, streamResponse } from "@/lib/server/media";
import { consume } from "@/lib/server/quota";
import { userFromRequest } from "@/lib/server/auth";
import { resolveMedia } from "@/lib/server/resolveMedia";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const ip = burstGuard(req, "dl", 30);
    const sp = new URL(req.url).searchParams;
    const platform = sp.get("platform") ?? "";
    const ref = sp.get("ref") ?? "";
    if (!isPlatform(platform) || !ref) throw new PlatformError("invalid_input", "Missing platform or ref", 400);
    const user = await userFromRequest(req);
    consume(user, ip, "downloads");
    const m = await resolveMedia(platform, ref, { author: sp.get("u") ?? undefined, index: Number(sp.get("i") ?? 0), kind: sp.get("kind") ?? undefined });
    const upstream = await fetchMedia(m.url, { cookie: m.cookie });
    return streamResponse(upstream, { filename: m.filename });
  } catch (e) {
    return fail(e);
  }
}
