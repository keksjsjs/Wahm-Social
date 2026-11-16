import { getDict } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui";
import { DownloadCenter } from "@/components/download/DownloadCenter";
import { BatchLinks } from "@/components/download/BatchLinks";
import { ProGate } from "@/components/profile/ProGate";
import { currentUser } from "@/lib/server/auth";
import { hasFeature } from "@/lib/plans";
import { ProBadge } from "@/components/ui";

export const metadata = buildMetadata({
  title: "تحميل فيديو تيك توك وانستقرام بدون علامة مائية | Wahm Downloader",
  description: "مركز التحميل من وهم: الصق رابط تيك توك أو انستقرام وحمل الفيديو أو الصور أو الصوت بأعلى جودة وبدون علامة مائية. TikTok & Instagram downloader.",
  path: "/download",
  keywords: ["تحميل تيك توك", "تحميل انستقرام", "tiktok downloader", "instagram reels download", "بدون علامة مائية"],
});

export const dynamic = "force-dynamic";

export default async function DownloadPage({ searchParams }: { searchParams: { url?: string } }) {
  const { t } = getDict();
  const user = await currentUser();
  return (
    <div className="container-w pb-10">
      <PageHeader title={t.download.title} subtitle={t.download.subtitle} />
      <DownloadCenter initialUrl={searchParams.url ?? ""} />
      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
          {t.download.batchTitle} <ProBadge />
        </h2>
        <p className="mb-4 text-sm text-slate-400">{t.download.batchDesc}</p>
        <ProGate locked={!hasFeature(user?.plan, "batch_download")} t={t}>
          <BatchLinks />
        </ProGate>
      </section>
    </div>
  );
}
