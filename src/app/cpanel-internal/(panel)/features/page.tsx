import { guardPage } from "@/lib/admin/pageGuard";
import { PanelShell, type Flashy } from "@/components/admin/PanelShell";
import { FormSection } from "@/components/admin/Section";
import { Select, Text, Toggle, Submit } from "@/components/admin/Fields";

export const dynamic = "force-dynamic";

export default async function FeaturesPage({ searchParams }: { searchParams: Flashy }) {
  const { base, settings: s } = await guardPage();
  const f = s.features;
  return (
    <PanelShell active="features" title="الميزات والأسعار" flash={searchParams}>
      <FormSection title="🎛️ تشغيل وإيقاف" desc="أي ميزة تطفيها تختفي من الموقع وترجع رسالة واضحة للزائر." action={`${base}/api/save?section=features`}>
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle name="tiktok" label="منصة تيك توك" checked={f.tiktok} />
          <Toggle name="instagram" label="منصة انستقرام" checked={f.instagram} />
          <Toggle name="followers" label="تبويب المتابعين / المتابَعين" checked={f.followers} />
          <Toggle name="stories" label="الستوري" checked={f.stories} />
          <Toggle name="downloads" label="التحميل" checked={f.downloads} />
          <Toggle name="pro" label="اشتراكات برو (المدفوعة)" checked={f.pro} />
        </div>
        <Select
          name="demoMode"
          label="وضع البيانات التجريبية DEMO_MODE"
          value={f.demoMode}
          options={[
            ["", "حسب إعداد Render (الافتراضي)"],
            ["auto", "auto — تجريبي فقط إذا فشل المصدر"],
            ["on", "on — بيانات تجريبية دائماً"],
            ["off", "off — بدون بيانات تجريبية"],
          ]}
        />
        <p className="text-sm font-semibold text-ink-2">💲 الأسعار (دولار)</p>
        <div className="grid gap-3 md:grid-cols-4">
          <Text name="proMonthly" label="برو شهري" value={String(f.prices.proMonthly)} dir="ltr" type="number" />
          <Text name="proYearly" label="برو سنوي" value={String(f.prices.proYearly)} dir="ltr" type="number" />
          <Text name="bizMonthly" label="أعمال شهري" value={String(f.prices.bizMonthly)} dir="ltr" type="number" />
          <Text name="bizYearly" label="أعمال سنوي" value={String(f.prices.bizYearly)} dir="ltr" type="number" />
        </div>
        <p className="text-xs text-ink-4">ملاحظة: إذا تستخدم Stripe بأسعار ثابتة (Price IDs) لازم تعدّلها في Stripe كمان.</p>
        <Submit />
      </FormSection>
    </PanelShell>
  );
}
