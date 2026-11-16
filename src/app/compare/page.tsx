import { getDict } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, ProBadge } from "@/components/ui";
import { CompareTool } from "@/components/compare/CompareTool";
import { ProGate } from "@/components/profile/ProGate";
import { currentUser } from "@/lib/server/auth";
import { hasFeature, planOf } from "@/lib/plans";
import { isPlatform, type Platform } from "@/lib/platforms/types";

export const metadata = buildMetadata({
  title: "مقارنة حسابات تيك توك وانستقرام | Wahm Compare",
  description: "قارن المتابعين ومعدل التفاعل ونشاط النشر بين عدة حسابات تيك توك وانستقرام جنباً إلى جنب.",
  path: "/compare",
});
export const dynamic = "force-dynamic";

export default async function ComparePage({ searchParams }: { searchParams: { a?: string | string[] } }) {
  const { t } = getDict();
  const user = await currentUser();
  const pro = hasFeature(user?.plan, "compare");
  const raw = ([] as string[]).concat(searchParams.a ?? []);
  const initial = raw
    .map((s) => s.split(":"))
    .filter(([p, u]) => isPlatform(p) && u)
    .map(([p, u]) => ({ platform: p as Platform, username: u }));
  if (initial.length === 1) initial.push({ platform: initial[0].platform, username: "" });
  return (
    <div className="container-w max-w-5xl pb-10">
      <PageHeader title={t.compare.title} subtitle={t.compare.subtitle} eyebrow={<ProBadge />} />
      <ProGate locked={!pro} t={t}>
        <CompareTool initial={initial} slots={pro ? planOf(user!.plan).compareSlots : 4} />
      </ProGate>
    </div>
  );
}
