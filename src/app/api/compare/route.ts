import { z } from "zod";
import { getPosts, getProfile } from "@/lib/platforms";
import { analyze } from "@/lib/analytics";
import { PlatformError } from "@/lib/platforms/types";
import { requireFeature } from "@/lib/server/auth";
import { handler, ok } from "@/lib/server/respond";
import { planOf } from "@/lib/plans";
import { isValidUsername, normalizeUsername } from "@/lib/format";
import { mapLimit } from "@/lib/server/concurrency";

const Body = z.object({
  accounts: z.array(z.object({ platform: z.enum(["tiktok", "instagram"]), username: z.string() })).min(2),
});

export const POST = handler(async (req: Request) => {
  const user = await requireFeature("compare");
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) throw new PlatformError("invalid_input", "Add at least two accounts", 400);
  const slots = planOf(user.plan).compareSlots;
  const accounts = body.data.accounts
    .map((a) => ({ ...a, username: normalizeUsername(a.username) }))
    .filter((a) => isValidUsername(a.username))
    .slice(0, slots);
  const rows = await mapLimit(accounts, 2, async (a) => {
    try {
      const [p, posts] = await Promise.all([getProfile(a.platform, a.username), getPosts(a.platform, a.username, 12)]);
      const an = analyze(p.data, posts.data);
      return {
        ok: true as const,
        source: p.source,
        profile: p.data,
        metrics: {
          followers: p.data.followers,
          following: p.data.following,
          posts: p.data.postsCount,
          likes: p.data.likes ?? null,
          avgViews: an.avgViews,
          avgLikes: an.avgLikes,
          avgComments: an.avgComments,
          engagementRate: an.engagementRate,
          postsPerWeek: an.postsPerWeek,
          growthScore: an.growthScore,
          tier: an.tier,
        },
      };
    } catch (e) {
      return { ok: false as const, account: a, error: (e as Error).message };
    }
  });
  return ok({ rows, slots });
});
