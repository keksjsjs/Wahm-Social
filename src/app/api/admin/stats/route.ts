import { requireAdmin } from "@/lib/server/auth";
import { cache } from "@/lib/server/cache";
import { Payments, Searches, Users } from "@/lib/server/db";
import { handler, ok } from "@/lib/server/respond";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requireAdmin();
  const users = Users.all();
  const payments = Payments.all();
  return ok({
    users: users.length,
    pro: users.filter((u) => u.plan !== "free").length,
    revenue: payments.reduce((s, p) => s + (p.status === "paid" ? p.amount : 0), 0),
    searches: Searches.total(),
    trending: Searches.trending(10),
    cache: cache.stats(),
    recentUsers: users.slice(-10).reverse().map((u) => ({ id: u.id, email: u.email, plan: u.plan, createdAt: u.createdAt })),
  });
});
