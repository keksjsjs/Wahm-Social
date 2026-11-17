import { getPosts, getProfile } from "@/lib/platforms";
import { analyze } from "@/lib/analytics";
import { burstGuard, parsePlatform, parseUsername } from "@/lib/server/guard";
import { handler, ok } from "@/lib/server/respond";
import { userFromRequest } from "@/lib/server/auth";
import { hasFeature } from "@/lib/plans";
import { requireFeatureOn } from "@/lib/site/flags";

export const dynamic = "force-dynamic";

export const GET = handler(async (req: Request, { params }: { params: { platform: string; username: string } }) => {
  burstGuard(req);
  requireFeatureOn("analytics");
  const platform = parsePlatform(params.platform);
  const username = parseUsername(params.username);
  const [profile, posts] = await Promise.all([getProfile(platform, username), getPosts(platform, username, 30)]);
  const a = analyze(profile.data, posts.data);
  const user = await userFromRequest(req);
  const pro = hasFeature(user?.plan, "advanced_analytics");
  const data = pro
    ? { ...a, pro: true }
    : {
        pro: false,
        postsAnalyzed: a.postsAnalyzed,
        avgViews: a.avgViews,
        avgLikes: a.avgLikes,
        engagementRate: a.engagementRate,
        postsPerWeek: a.postsPerWeek,
        tier: a.tier,
        growthScore: a.growthScore,
        topHashtags: a.topHashtags.slice(0, 3),
      };
  const source = profile.source === "demo" || posts.source === "demo" ? "demo" : profile.source;
  return ok(data, source);
});
