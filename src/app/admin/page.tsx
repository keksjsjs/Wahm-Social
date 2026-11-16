import { redirect } from "next/navigation";
import { currentUser } from "@/lib/server/auth";
import { Payments, Searches, Users } from "@/lib/server/db";
import { cache } from "@/lib/server/cache";
import { buildMetadata } from "@/lib/seo";
import { Stat, Badge } from "@/components/ui";
import { date, timeAgo } from "@/lib/format";
import { getDict } from "@/lib/i18n/server";
import { env, billingMode } from "@/lib/env";

export const metadata = buildMetadata({ title: "Admin | Wahm Social", noindex: true });
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/account");
  const { locale, t } = getDict();
  const users = Users.all();
  const payments = Payments.all();
  const revenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const c = cache.stats();
  return (
    <div className="container-w py-10">
      <h1 className="mb-6 text-3xl font-extrabold text-white">{t.nav.admin}</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Users" value={users.length} />
        <Stat label="Paid" value={users.filter((u) => u.plan !== "free").length} />
        <Stat label="Revenue (USD)" value={`$${revenue.toFixed(2)}`} />
        <Stat label="Searches" value={Searches.total()} />
        <Stat label="Cache hit %" value={c.hits + c.misses ? Math.round((c.hits / (c.hits + c.misses)) * 100) + "%" : "—"} />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Badge tone={billingMode() === "stripe" ? "green" : "blue"}>billing: {billingMode()}</Badge>
        <Badge tone={env.igSessionId ? "green" : "red"}>IG session: {env.igSessionId ? "set" : "unset"}</Badge>
        <Badge>demo: {env.demoMode}</Badge>
        <Badge>proxy: {env.scraperProxy ? "set" : "none"}</Badge>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-3 font-bold text-white">Recent users</h2>
          <table className="w-full text-sm">
            <tbody>
              {users
                .slice(-15)
                .reverse()
                .map((u) => (
                  <tr key={u.id} className="border-b border-white/[0.05]">
                    <td className="py-2 text-slate-200" dir="ltr">
                      {u.email}
                    </td>
                    <td className="py-2">
                      <Badge tone={u.plan === "free" ? "default" : "gold"}>{u.plan}</Badge>
                    </td>
                    <td className="py-2 text-slate-400">{date(u.createdAt, locale)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="card p-6">
          <h2 className="mb-3 font-bold text-white">Recent searches</h2>
          <ul className="space-y-1 text-sm">
            {Searches.recent(15).map((s, i) => (
              <li key={i} className="flex justify-between border-b border-white/[0.05] py-1.5">
                <span className="text-slate-200" dir="ltr">
                  {s.platform}:@{s.username}
                </span>
                <span className="text-slate-500">{timeAgo(s.at, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
