import { getConnections } from "@/lib/platforms";
import { burstGuard, parsePlatform, parseUsername } from "@/lib/server/guard";
import { handler, ok } from "@/lib/server/respond";

export const dynamic = "force-dynamic";

export const GET = handler(async (req: Request, { params }: { params: { platform: string; username: string } }) => {
  burstGuard(req);
  const platform = parsePlatform(params.platform);
  const username = parseUsername(params.username);
  const sp = new URL(req.url).searchParams;
  const raw = sp.get("kind") ?? sp.get("type");
  const kind = raw === "following" ? "following" : "followers";
  const r = await getConnections(platform, username, kind, sp.get("cursor") ?? undefined);
  return ok(r.data, r.source, r.notice);
});
