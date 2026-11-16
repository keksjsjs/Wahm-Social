import Link from "next/link";
import { getDict } from "@/lib/i18n/server";

export default function NotFound() {
  const { t } = getDict();
  return (
    <div className="container-w grid min-h-[60vh] place-items-center text-center">
      <div>
        <div className="accent-text text-8xl font-black">404</div>
        <h1 className="mt-4 text-2xl font-bold text-ink">{t.profile.notFound}</h1>
        <p className="mt-2 text-ink-3">{t.profile.notFoundDesc}</p>
        <Link href="/" className="btn-primary mt-6">
          {t.nav.home}
        </Link>
      </div>
    </div>
  );
}
