import { getPost } from "@/lib/platforms";
import { burstGuard, parsePlatform } from "@/lib/server/guard";
import { handler, ok } from "@/lib/server/respond";
import { PlatformError } from "@/lib/platforms/types";

export const dynamic = "force-dynamic";

export const GET = handler(async (req: Request, { params }: { params: { platform: string } }) => {
  burstGuard(req);
  const platform = parsePlatform(params.platform);
  const sp = new URL(req.url).searchParams;
  const ref = sp.get("ref");
  if (!ref) throw new PlatformError("invalid_input", "Missing ref", 400);
  const r = await getPost(platform, ref, sp.get("u") ?? undefined);
  return ok(r.data, r.source);
});
