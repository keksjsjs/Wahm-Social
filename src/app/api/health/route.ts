import { NextResponse, type NextRequest } from "next/server";
import { cache } from "@/lib/server/cache";
import { env, billingMode } from "@/lib/env";
import { lastIgLookup } from "@/lib/platforms/instagram/session/diagnostics";
import { researchStatus } from "@/lib/platforms/connections";
import { lastFollowerTry, sessionConfigured, regionHintCount, regionHintSample, lastListUserKeys } from "@/lib/platforms/tiktok/followers/web";
import { lastBrowserListTry } from "@/lib/platforms/tiktok/followers/browser";
import { regionTry } from "@/lib/platforms/tiktok/region";
import { tikwmTry } from "@/lib/platforms/tiktok/tikwm";
import { countikTry } from "@/lib/platforms/tiktok/countik";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const deep = req.nextUrl.searchParams.get("ig") === "1";
  return NextResponse.json({
    ok: true,
    service: "frostly",
    time: new Date().toISOString(),
    uptimeSec: Math.round(process.uptime()),
    cache: cache.stats(),
    demoMode: env.demoMode,
    billing: billingMode(),
    instagramSession: Boolean(env.igSessionId),
    ...(deep
      ? {
          // Presence flags and last attempt statuses only — never cookie values.
          scraperProxy: Boolean(env.scraperProxy),
          tiktokSession: Boolean(env.tiktokSessionId),
          tiktokCookie: Boolean(env.tiktokCookie),
          tiktokSessionFlags: sessionConfigured(),
          tiktokLastFollowerTry: lastFollowerTry(),
          tiktokLastBrowserTry: lastBrowserListTry(),
          tiktokLastRegionTry: regionTry(),
          tiktokLastTikwmTry: tikwmTry(),
          tiktokLastCountikTry: countikTry(),
          tiktokRegionHints: { count: regionHintCount(), sample: regionHintSample(), userKeys: lastListUserKeys() },
          instagramCookies: { csrftoken: !!env.igCsrfToken, ds_user_id: !!env.igDsUserId, mid: !!env.igMid, datr: !!env.igDatr },
          instagramLastLookup: lastIgLookup(),
          tiktokResearch: researchStatus(),
        }
      : {}),
  });
}
