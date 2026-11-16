import { guardPage } from "@/lib/admin/pageGuard";
import { PanelShell, type Flashy } from "@/components/admin/PanelShell";
import { FormSection } from "@/components/admin/Section";
import { Text, Submit } from "@/components/admin/Fields";
import { SecretField } from "@/components/admin/SecretField";
import { secretStatus } from "@/lib/admin/secretStatus";
import { getSettings } from "@/lib/site/store";
import { originalEnv } from "@/lib/site/apply";

export const dynamic = "force-dynamic";

export default async function ProxyPage({ searchParams }: { searchParams: Flashy }) {
  const { base } = await guardPage();
  const settings = await getSettings();
  const renderRelay = originalEnv("RELAY_URL") || "";
  const relayHint = settings.relayUrl
    ? "هذا الرابط يحفظ في إعدادات الموقع ويغلّب قيمة Render."
    : renderRelay
      ? "الخانة فاضية، لذلك نستخدم قيمة RELAY_URL من Render."
      : "اتركه فارغاً لاستخدام قيمة Render إن وُجدت، أو الصق رابط الـ Worker هنا.";
  return (
    <PanelShell active="proxy" title="البروكسي" flash={searchParams}>
      <FormSection
        title="🌐 بروكسي السحب SCRAPER_PROXY"
        desc="كل طلبات انستقرام وتيك توك وtikwm/countik تمر عبره إذا ما كان فيه مسار Worker. بروكسي سكني أو بروكسي راوتر البيت يحل حظر عنوان السيرفر. الصيغة: http://user:pass@host:port"
        action={`${base}/api/secrets?page=proxy`}
      >
        {secretStatus("proxy").map((x) => (
          <SecretField key={x.def.key} {...x} />
        ))}
        <Submit label="حفظ البروكسي" />
      </FormSection>
      <FormSection title="🧪 اختبار البروكسي" desc="يجرب يفتح tiktok.com و tikwm.com و countik.com عبر البروكسي ويعرض النتيجة. اترك الخانة فاضية لاختبار البروكسي المحفوظ (أو الاتصال المباشر إذا ما فيه)." action={`${base}/api/proxy-test`}>
        <Text name="candidate" label="جرّب رابط بدون حفظ (اختياري)" type="password" dir="ltr" placeholder="http://user:pass@host:port" />
        <Submit label="اختبار الآن" />
      </FormSection>
      <FormSection
        title="☁️ مسار Cloudflare Worker  RELAY_URL"
        desc="إذا انضبط، طلبات GET لمواقع www.tiktok.com و tikwm.com و countik.com تمر من خلال الـ Worker بدل عنوان سيرفر Render. مثال: https://frostly.xxxxx.workers.dev — الطلبات المسجّلة (فيها Cookie) وطلبات POST تبقى مباشرة أو عبر البروكسي."
        action={`${base}/api/save?section=relay`}
      >
        <Text
          name="relayUrl"
          label="رابط الـ Worker"
          value={settings.relayUrl}
          dir="ltr"
          placeholder="https://name.workers.dev"
          hint={relayHint}
        />
        <Submit label="حفظ مسار الـ Worker" />
      </FormSection>
      <FormSection
        title="🧪 اختبار الـ Worker"
        desc="يجرب صفحة حساب تيك توك وواجهة countik من خلال الـ Worker ويعرض النتيجة. اترك الخانة فاضية لاختبار الرابط المحفوظ."
        action={`${base}/api/proxy-test`}
      >
        <input type="hidden" name="mode" value="relay" />
        <Text name="relayCandidate" label="جرّب رابط بدون حفظ (اختياري)" dir="ltr" placeholder="https://name.workers.dev" />
        <Submit label="اختبار الـ Worker الآن" />
      </FormSection>
    </PanelShell>
  );
}
