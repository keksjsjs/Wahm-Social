import { getDict } from "@/lib/i18n/server";
import { buildMetadata, jsonLdFaq } from "@/lib/seo";
import { PageHeader, Badge } from "@/components/ui";
import { PricingTable } from "@/components/pricing/PricingTable";
import { currentUser } from "@/lib/server/auth";
import { billingMode } from "@/lib/env";
import { FAQ } from "@/lib/content/faq";
import { Faq } from "@/components/content/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { FEATURE_LABELS, PLANS, type Feature } from "@/lib/plans";

export const metadata = buildMetadata({ title: "الأسعار — وهم برو | Wahm Pro Pricing", path: "/pricing", description: "خطط وهم سوشال: مجاني، برو، وأعمال. تحميل جماعي، مقارنة، مراقبة، تحليلات متقدمة وAPI." });
export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const { t, locale } = getDict();
  const user = await currentUser();
  const features = Object.keys(FEATURE_LABELS) as Feature[];
  return (
    <div className="container-w pb-10">
      <JsonLd data={jsonLdFaq(FAQ[locale])} />
      <PageHeader title={t.pricing.title} subtitle={t.pricing.subtitle} eyebrow={<Badge tone="gold">Wahm Pro</Badge>} />
      <PricingTable currentPlan={user?.plan ?? null} mock={billingMode() === "mock"} />
      <div className="card mt-16 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400">
              <th className="p-4 text-start">{t.compare.metric}</th>
              {Object.values(PLANS).map((p) => (
                <th key={p.id} className="p-4 text-center text-white">
                  {p.name[locale]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f} className="border-b border-white/[0.04]">
                <td className="p-4 text-slate-300">{FEATURE_LABELS[f][locale]}</td>
                {Object.values(PLANS).map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    {p.features.includes(f) ? <span className="text-gold-400">✓</span> : <span className="text-slate-600">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="section-title mb-6 mt-16 text-center">{t.pricing.faq}</h2>
      <Faq items={FAQ[locale]} />
    </div>
  );
}
