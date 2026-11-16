import { NextResponse } from "next/server";
import { cache } from "@/lib/server/cache";
import { env, billingMode } from "@/lib/env";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "wahm-social",
    time: new Date().toISOString(),
    uptimeSec: Math.round(process.uptime()),
    cache: cache.stats(),
    demoMode: env.demoMode,
    billing: billingMode(),
    instagramSession: Boolean(env.igSessionId),
  });
}
