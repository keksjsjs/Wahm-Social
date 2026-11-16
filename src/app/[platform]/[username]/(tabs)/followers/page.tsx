import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { parseRoute } from "@/lib/server/loaders";
import { getConnections } from "@/lib/platforms";
import { ConnectionsPanel } from "@/components/profile/ConnectionsPanel";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { platform: string; username: string } }) {
  const r = parseRoute(params.platform, params.username);
  if (!r) notFound();
  const { t } = getDict();
  const result = await getConnections(r.platform, r.username, "followers");
  return <ConnectionsPanel result={result} t={t} />;
}
