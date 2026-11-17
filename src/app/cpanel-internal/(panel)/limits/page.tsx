import { guardPage } from "@/lib/admin/pageGuard";
import { PanelShell, type Flashy } from "@/components/admin/PanelShell";
import { FormSection } from "@/components/admin/Section";
import { Text, Submit } from "@/components/admin/Fields";

export const dynamic = "force-dynamic";

export default async function LimitsPage({ searchParams }: { searchParams: Flashy }) {
  const { base, settings: s } = await guardPage();
  const l = s.limits;
  const n = (name: keyof typeof l, label: string, hint: string) => <Text name={name} label={label} value={String(l[name])} dir="ltr" type="number" hint={hint} />;
  return (
    <PanelShell active="limits" title="الحدود والكاش" flash={searchParams}>
      <FormSection title="👥 القوائم" desc="كم صف يظهر في تبويب المتابعين/المتابَعين." action={`${base}/api/save?section=limits`}>
        {n("followersShow", "عدد المتابعين المعروض", "من 1 إلى 50 (تيك توك يرجّع ~30 بالطلب الواحد)")}
        <p className="pt-2 text-sm font-semibold text-ink-2">🗄️ مدة الكاش (بالدقائق)</p>
        <div className="grid gap-3 md:grid-cols-2">
          {n("profileCacheMin", "الملف الشخصي", "افتراضي 10")}
          {n("postsCacheMin", "المنشورات", "افتراضي 10")}
          {n("storiesCacheMin", "الستوري", "افتراضي 3")}
          {n("regionCacheMin", "دولة الحساب", "افتراضي 360 (6 ساعات)")}
        </div>
        <p className="pt-2 text-sm font-semibold text-ink-2">🚦 حد الطلبات لكل IP بالدقيقة</p>
        <div className="grid gap-3 md:grid-cols-3">
          {n("apiPerMin", "واجهات البحث والحسابات", "افتراضي 40")}
          {n("downloadPerMin", "التحميل", "افتراضي 30")}
          {n("streamPerMin", "بث الوسائط", "افتراضي 120")}
        </div>
        <p className="text-xs text-ink-4">التغيير يطبّق على الطلبات الجديدة خلال أقل من دقيقة. الكاش الحالي يبقى لين ينتهي (أو امسحه من صفحة الحالة).</p>
        <Submit />
      </FormSection>
    </PanelShell>
  );
}
