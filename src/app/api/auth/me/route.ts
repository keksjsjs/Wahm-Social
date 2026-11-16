import { NextResponse } from "next/server";
import { currentUser, publicUser } from "@/lib/server/auth";
import { usageSummary } from "@/lib/server/quota";
import { clientIp } from "@/lib/server/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = await currentUser();
  return NextResponse.json({ ok: true, data: { user: u ? publicUser(u) : null, usage: usageSummary(u, clientIp(req)) } });
}
