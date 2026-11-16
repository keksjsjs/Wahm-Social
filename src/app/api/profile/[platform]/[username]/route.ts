import { getProfile } from "@/lib/platforms";
import { burstGuard, parsePlatform, parseUsername } from "@/lib/server/guard";
import { handler, ok } from "@/lib/server/respond";
import { consume } from "@/lib/server/quota";
import { userFromRequest } from "@/lib/server/auth";
import { Searches } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export const GET = handler(async (req: Request, { params }: { params: { platform: string; username: string } }) => {
  const ip = burstGuard(req);
  const platform = parsePlatform(params.platform);
  const username = parseUsername(params.username);
  const user = await userFromRequest(req);
  consume(user, ip, "lookups");
  const r = await getProfile(platform, username);
  if (r.source !== "demo") Searches.log(platform, username);
  return ok(r.data, r.source, r.notice);
});
