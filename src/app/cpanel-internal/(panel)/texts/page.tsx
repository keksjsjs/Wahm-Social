import { guardPage } from "@/lib/admin/pageGuard";
import { PanelShell, type Flashy } from "@/components/admin/PanelShell";
import { FormSection } from "@/components/admin/Section";
import { BiText, Text, Toggle, Submit } from "@/components/admin/Fields";

export const dynamic = "force-dynamic";

export default async function TextsPage({ searchParams }: { searchParams: Flashy }) {
  const { base, settings: s } = await guardPage();
  return (
    <PanelShell active="texts" title="الاسم والنصوص" flash={searchParams}>
      <FormSection title="📣 شريط الإعلان" desc="يظهر أعلى كل صفحات الموقع." action={`${base}/api/save?section=banner`}>
        <Toggle name="bannerEnabled" label="إظهار شريط الإعلان" checked={s.texts.bannerEnabled} />
        <BiText name="banner" label="نص الإعلان" value={s.texts.banner} />
        <Text name="bannerLink" label="رابط عند الضغط (اختياري)" value={s.texts.bannerLink} dir="ltr" placeholder="https://… أو /pricing" />
        <Submit />
      </FormSection>
      <FormSection title="✏️ اسم الموقع ونصوص الواجهة" desc="اترك أي خانة فاضية عشان يرجع للنص الافتراضي." action={`${base}/api/save?section=texts`}>
        <BiText name="siteName" label="اسم الموقع" value={s.brand.siteName} />
        <BiText name="tagline" label="الوصف المختصر (الفوتر)" value={s.brand.tagline} area />
        <BiText name="heroBadge" label="شارة أعلى الصفحة الرئيسية" value={s.texts.heroBadge} />
        <BiText name="heroTitle1" label="العنوان الرئيسي — الجزء الأول" value={s.texts.heroTitle1} />
        <BiText name="heroTitle2" label="العنوان الرئيسي — الجزء الملوّن" value={s.texts.heroTitle2} />
        <BiText name="heroSubtitle" label="النص تحت العنوان" value={s.texts.heroSubtitle} area />
        <BiText name="footerDisclaimer" label="تنبيه الفوتر" value={s.texts.footerDisclaimer} area />
        <BiText name="footerRights" label="جملة الحقوق" value={s.texts.footerRights} />
        <Text name="footerCredit" label="سطر الحقوق (بعد ©)" value={s.texts.footerCredit} dir="ltr" />
        <Submit />
      </FormSection>
    </PanelShell>
  );
}
