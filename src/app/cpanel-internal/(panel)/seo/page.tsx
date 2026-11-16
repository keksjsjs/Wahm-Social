import { guardPage } from "@/lib/admin/pageGuard";
import { PanelShell, type Flashy } from "@/components/admin/PanelShell";
import { FormSection, Section } from "@/components/admin/Section";
import { Area, Text, Toggle, Submit } from "@/components/admin/Fields";
import type { AssetSettings } from "@/lib/site/types";

export const dynamic = "force-dynamic";

const ASSETS: [keyof AssetSettings, string, string, string][] = [
  ["favicon", "أيقونة الموقع (Favicon)", "تظهر في تبويب المتصفح ونتائج جوجل. مربعة 512×512 PNG أو SVG أو ICO.", "/icon.svg"],
  ["ogImage", "صورة المشاركة (OG Image)", "تظهر لما أحد يشارك رابط الموقع (واتساب، تويتر…). المقاس المثالي 1200×630.", "/api/og"],
  ["heroImage", "صورة الصفحة الرئيسية", "الصورة الكبيرة جنب مربع البحث.", "/hero.webp"],
];

export default async function SeoPage({ searchParams }: { searchParams: Flashy }) {
  const { base, settings: s } = await guardPage();
  const seo = s.seo;
  return (
    <PanelShell active="seo" title="SEO والصور" flash={searchParams}>
      <FormSection title="🔎 محركات البحث" action={`${base}/api/save?section=seo`}>
        <Toggle name="robotsIndex" label="السماح لمحركات البحث بأرشفة الموقع" checked={seo.robotsIndex} hint="إذا أطفأته: robots.txt يمنع كل شي + noindex لكل الصفحات." />
        <Text name="defaultTitle" label="العنوان الافتراضي للموقع" value={seo.defaultTitle} />
        <Text name="titleTemplate" label="قالب العناوين" value={seo.titleTemplate} dir="ltr" hint="لازم يحتوي %s — مثال: %s | Frostly" />
        <Text name="homeTitle" label="عنوان الصفحة الرئيسية" value={seo.homeTitle} />
        <Area name="description" label="الوصف (Meta description)" value={seo.description} rows={4} />
        <Area name="keywords" label={`كلمات البحث (${seo.keywords.length}) — كلمة في كل سطر`} value={seo.keywords.join("\n")} rows={12} />
        <div className="grid gap-3 md:grid-cols-3">
          <Text name="googleVerification" label="كود تحقق Google Search Console" value={seo.googleVerification} dir="ltr" />
          <Text name="bingVerification" label="كود تحقق Bing (msvalidate.01)" value={seo.bingVerification} dir="ltr" />
          <Text name="twitterHandle" label="حساب X/تويتر" value={seo.twitterHandle} dir="ltr" />
        </div>
        <Submit />
      </FormSection>
      <Section title="🖼️ الصور والأيقونات" desc="الصور تنحفظ مع الإعدادات (حد أقصى 1.5MB).">
        <div className="grid gap-4 md:grid-cols-3">
          {ASSETS.map(([kind, label, hint, fallback]) => {
            const cur = s.assets[kind];
            return (
              <form key={kind} method="post" action={`${base}/api/upload`} encType="multipart/form-data" className="card space-y-3 p-4">
                <input type="hidden" name="kind" value={kind} />
                <p className="font-semibold text-ink">{label}</p>
                <p className="text-xs text-ink-4">{hint}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cur ? `/api/site-asset/${cur}` : fallback} alt="" className="h-24 w-full rounded-xl bg-surface-2 object-contain" />
                <p className="text-xs text-ink-4">{cur ? "صورة مرفوعة" : "الافتراضية"}</p>
                <input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/gif" className="w-full text-xs text-ink-3" />
                {cur && (
                  <label className="flex items-center gap-2 text-xs text-ink-3">
                    <input type="checkbox" name="remove" /> رجّع الافتراضية
                  </label>
                )}
                <Submit label="رفع / تحديث" />
              </form>
            );
          })}
        </div>
      </Section>
    </PanelShell>
  );
}
