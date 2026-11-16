import { getPosts } from "@/lib/platforms";
import { burstGuard, parsePlatform, parseUsername } from "@/lib/server/guard";
import { handler, ok } from "@/lib/server/respond";

export const dynamic = "force-dynamic";

export const GET = handler(async (req: Request, { params }: { params: { platform: string; username: string } }) => {
  burstGuard(req);
  const platform = parsePlatform(params.platform);
  const username = parseUsername(params.username);
  const limit = Math.min(30, Math.max(1, Number(new URL(req.url).searchParams.get("limit") ?? 12)));
  const r = await getPosts(platform, username, limit);
  return ok(r.data, r.source, r.notice);
});
