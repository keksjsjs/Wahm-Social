import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n/server";
import { parseRoute } from "@/lib/server/loaders";
import { getConnections } from "@/lib/platforms";
import { ConnectionsPanel } from "@/components/profile/connections/ConnectionsPanel";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { PlatformError } from "@/lib/platforms/types";

export const dynamic = "force-dynamic";

export default async function Page({ params, searchParams }: { params: { platform: string; username: string }; searchParams: { cursor?: string } }) {
  const r = parseRoute(params.platform, params.username);
  if (!r) notFound();
  const { t, locale } = getDict();
  try {
    const res = await getConnections(r.platform, r.username, "following", searchParams.cursor);
    return <ConnectionsPanel result={res.data} kind="following" platform={r.platform} username={r.username} t={t} locale={locale} />;
  } catch (e) {
    const pe = e instanceof PlatformError ? e : new PlatformError("internal", "Unexpected error", 500);
    return <ErrorPanel code={pe.code} message={pe.message} t={t} />;
  }
}
