import type { Platform, RelatedAccounts as Related } from "@/lib/platforms/types";
import type { Locale } from "@/lib/i18n";
import { ConnectionRow } from "./ConnectionRow";
import { RELATED_COPY } from "./copy";

export function RelatedAccounts({ related, platform, locale }: { related: Related; platform: Platform; locale: Locale }) {
  const [title, desc] = RELATED_COPY[related.kind][locale];
  return (
    <section>
      <div className="mb-3">
        <h3 className="flex items-center gap-2 text-base font-bold text-ink">
          <span aria-hidden>💬</span> {title} <span className="text-sm font-normal text-ink-3">({related.items.length})</span>
        </h3>
        <p className="mt-1 text-xs text-ink-3">{desc}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {related.items.map((c) => (
          <ConnectionRow key={c.username} c={c} platform={platform} locale={locale} />
        ))}
      </div>
    </section>
  );
}
