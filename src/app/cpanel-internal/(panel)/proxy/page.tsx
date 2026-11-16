import { guardPage } from "@/lib/admin/pageGuard";
import { PanelShell, type Flashy } from "@/components/admin/PanelShell";
import { FormSection } from "@/components/admin/Section";
import { Text, Submit } from "@/components/admin/Fields";
import { SecretField } from "@/components/admin/SecretField";
import { secretStatus } from "@/lib/admin/secretStatus";

export const dynamic = "force-dynamic";

export default async function ProxyPage({ searchParams }: { searchParams: Flashy }) {
  const { base } = await guardPage();
  return (
    <PanelShell active="proxy" title="البروكسي" flash={searchParams}>
      <FormSection
        title="🌐 بروكسي السحب SCRAPER_PROXY"
        desc="كل طلبات انستقرام وتيك توك وtikwm/countik تمر عبره. بروكسي سكني أو بروكسي راوتر البيت يحل حظر عنوان السيرفر. الصيغة: http://user:pass@host:port"
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
    </PanelShell>
  );
}
