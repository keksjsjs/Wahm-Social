import { guardPage } from "@/lib/admin/pageGuard";
import { PanelShell, type Flashy } from "@/components/admin/PanelShell";
import { FormSection, Section } from "@/components/admin/Section";
import { Text, Submit } from "@/components/admin/Fields";

export const dynamic = "force-dynamic";

export default async function SecurityPage({ searchParams }: { searchParams: Flashy }) {
  const { base } = await guardPage();
  return (
    <PanelShell active="security" title="الأمان" flash={searchParams}>
      <FormSection title="🔒 تغيير كلمة المرور" desc="بعد التغيير كل الجلسات القديمة تطلع تلقائياً." action={`${base}/api/password`}>
        <Text name="current" label="كلمة المرور الحالية" type="password" dir="ltr" />
        <div className="grid gap-3 md:grid-cols-2">
          <Text name="next" label="كلمة المرور الجديدة (10 أحرف على الأقل)" type="password" dir="ltr" />
          <Text name="confirm" label="تأكيد كلمة المرور" type="password" dir="ltr" />
        </div>
        <Submit label="تغيير" />
      </FormSection>
      <Section title="ℹ️ معلومات">
        <ul className="list-inside list-disc space-y-1 text-sm text-ink-3">
          <li>رابط اللوحة سري — لا تشاركه. أي مسار ثاني مثل /admin يرجع 404.</li>
          <li>تسجيل الدخول محدود بـ 5 محاولات كل 15 دقيقة لكل IP.</li>
          <li>الجلسة تنتهي بعد 12 ساعة.</li>
          <li>الأسرار (الكوكيز والمفاتيح) محفوظة مشفّرة AES-256-GCM ولا تنعرض كاملة أبداً.</li>
        </ul>
      </Section>
    </PanelShell>
  );
}
