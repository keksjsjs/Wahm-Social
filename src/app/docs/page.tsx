import { getDict } from "@/lib/i18n/server";
import { PAGES } from "@/lib/content/pages";
import { buildMetadata } from "@/lib/seo";
import { StaticPage } from "@/components/content/StaticPage";

const page = PAGES["docs"];
export const metadata = buildMetadata({ title: `${page.title.ar} | ${page.title.en} — Frostly`, path: "/docs" });

export default function Page() {
  const { locale } = getDict();
  return <StaticPage title={page.title[locale]} body={page.body[locale]} />;
}
