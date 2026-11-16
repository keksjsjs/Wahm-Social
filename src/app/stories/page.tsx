import { getDict } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui";
import { QuickJump } from "@/components/search/QuickJump";
import { Faq } from "@/components/content/Faq";

export const metadata = buildMetadata({
  title: "عارض ستوري انستقرام العامة وتحميلها | Wahm Story Viewer",
  description: "شاهد وحمّل ستوري انستقرام للحسابات العامة فقط بسهولة. لا نصل للحسابات الخاصة ولا نطلب كلمة المرور.",
  path: "/stories",
});

export default function StoriesPage() {
  const { t, locale } = getDict();
  const faq =
    locale === "ar"
      ? [
          { q: "هل أستطيع رؤية ستوري حساب خاص؟", a: "لا، نعرض الستوري العامة فقط." },
          { q: "هل تظهر في قائمة المشاهدين؟", a: "نحن نجلب الستوري من سيرفراتنا، ولا نستخدم حسابك الشخصي." },
          { q: "لماذا لا تظهر ستوري تيك توك؟", a: t.stories.tiktokNote },
        ]
      : [
          { q: "Can I see a private account's story?", a: "No, only public stories are shown." },
          { q: "Will I appear in the viewers list?", a: "We fetch stories from our servers, never using your personal account." },
          { q: "Why don't TikTok stories show?", a: t.stories.tiktokNote },
        ];
  return (
    <div className="container-w pb-10">
      <PageHeader title={t.stories.title} subtitle={t.stories.subtitle} />
      <QuickJump tab="stories" />
      <div className="mt-16">
        <Faq items={faq} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
