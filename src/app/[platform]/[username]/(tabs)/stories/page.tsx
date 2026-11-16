import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { loadStories, parseRoute } from "@/lib/server/loaders";
import { StoryViewer } from "@/components/profile/StoryViewer";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { EmptyState } from "@/components/ui";
import { NoticeBar } from "@/components/ui/SourceBadge";

export const dynamic = "force-dynamic";

export default async function StoriesTab({ params }: { params: { platform: string; username: string } }) {
  const r = parseRoute(params.platform, params.username);
  if (!r) notFound();
  const { t } = getDict();
  if (r.platform === "tiktok") return <EmptyState icon="◔" title={t.stories.none} desc={t.stories.tiktokNote} />;
  const res = await loadStories(r.platform, r.username);
  if (!res.ok) return <ErrorPanel code={res.code} message={res.message} t={t} />;
  return (
    <section>
      <NoticeBar notice={res.value.notice} />
      {res.value.data.length ? <StoryViewer stories={res.value.data} downloadable={res.value.source !== "demo"} /> : <EmptyState icon="◔" title={t.stories.none} />}
    </section>
  );
}
