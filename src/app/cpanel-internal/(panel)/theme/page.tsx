import { guardPage } from "@/lib/admin/pageGuard";
import { PanelShell, type Flashy } from "@/components/admin/PanelShell";
import { FormSection } from "@/components/admin/Section";
import { Select, Text, Submit } from "@/components/admin/Fields";

export const dynamic = "force-dynamic";

export default async function ThemePage({ searchParams }: { searchParams: Flashy }) {
  const { base, settings: s } = await guardPage();
  return (
    <PanelShell active="theme" title="الألوان والثيم" flash={searchParams}>
      <FormSection title="🎨 ألوان الموقع" desc="اللون الأساسي للأزرار والروابط، والثانوي لنهاية التدرّج." action={`${base}/api/save?section=theme`}>
        <div className="grid gap-3 md:grid-cols-2">
          <Text name="accentPrimary" label="اللون الأساسي" value={s.theme.accentPrimary || "#6378f6"} type="color" />
          <Text name="accentSecondary" label="اللون الثانوي" value={s.theme.accentSecondary || "#8b5cf6"} type="color" />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-3">
          <input type="checkbox" name="reset" defaultChecked={!s.theme.accentPrimary} /> استخدم الألوان الأصلية (تجاهل الألوان فوق)
        </label>
        <Select
          name="defaultTheme"
          label="الوضع الافتراضي للزوار الجدد"
          value={s.theme.defaultTheme}
          options={[
            ["system", "حسب جهاز الزائر"],
            ["light", "فاتح ☀️"],
            ["dark", "داكن 🌙"],
          ]}
        />
        <Submit />
      </FormSection>
    </PanelShell>
  );
}
