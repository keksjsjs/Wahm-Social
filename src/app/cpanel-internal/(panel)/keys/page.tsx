import { guardPage } from "@/lib/admin/pageGuard";
import { PanelShell, type Flashy } from "@/components/admin/PanelShell";
import { FormSection } from "@/components/admin/Section";
import { Submit } from "@/components/admin/Fields";
import { SecretField } from "@/components/admin/SecretField";
import { secretStatus } from "@/lib/admin/secretStatus";

export const dynamic = "force-dynamic";

const GROUPS: ["instagram" | "tiktok" | "billing", string, string][] = [
  ["instagram", "📸 جلسة انستقرام", "كوكيز حساب انستقرام (للستوري والقوائم). القيم تنحفظ مشفّرة ولا تنعرض أبداً."],
  ["tiktok", "🎵 تيك توك", "كوكيز الجلسة + مفاتيح تطبيق المطورين."],
  ["billing", "💳 الدفع (Stripe)", "اتركها فاضية لوضع الدفع التجريبي."],
];

export default async function KeysPage({ searchParams }: { searchParams: Flashy }) {
  const { base } = await guardPage();
  return (
    <PanelShell active="keys" title="الجلسات والمفاتيح" flash={searchParams}>
      {GROUPS.map(([g, title, desc]) => (
        <FormSection key={g} title={title} desc={desc} action={`${base}/api/secrets?page=keys`}>
          {secretStatus(g).map((x) => (
            <SecretField key={x.def.key} {...x} />
          ))}
          <Submit />
        </FormSection>
      ))}
    </PanelShell>
  );
}
