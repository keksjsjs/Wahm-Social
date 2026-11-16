import Link from "next/link";
import type { Dict } from "@/lib/i18n";
import { EmptyState } from "./index";

export function ErrorPanel({ code, message, t }: { code: string; message: string; t: Dict }) {
  if (code === "not_found") return <EmptyState icon="?" title={t.profile.notFound} desc={t.profile.notFoundDesc} action={<Link href="/" className="btn-primary">{t.nav.home}</Link>} />;
  if (code === "private_account") return <EmptyState icon="🔒" title={t.profile.private} desc={t.profile.privateDesc} />;
  if (code === "rate_limited") return <EmptyState icon="⏳" title={t.states.rateLimited} action={<Link href="/pricing" className="btn-primary">{t.pro.upgrade}</Link>} />;
  if (code === "blocked") return <EmptyState icon="⚠" title={t.states.blocked} desc={message} />;
  return <EmptyState icon="!" title={t.states.error} desc={message} />;
}
