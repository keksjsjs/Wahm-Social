import type { ConnectionAttempt } from "@/lib/platforms/types";
import type { Locale } from "@/lib/i18n";
import { METHOD_COPY, NOTE_COPY } from "./copy";

/** Transparent list of every method tried to read the real list. */
export function AttemptsList({ attempts, locale }: { attempts: ConnectionAttempt[]; locale: Locale }) {
  return (
    <ol className="space-y-2 text-sm">
      {attempts.map((a, i) => (
        <li key={`${a.method}-${i}`} className="flex items-start gap-2 rounded-xl border border-line bg-glass px-3 py-2">
          <span aria-hidden className={a.ok ? "text-emerald-500" : "text-ink-4"}>{a.ok ? "✓" : "✕"}</span>
          <span className="min-w-0">
            <span className="font-semibold text-ink">{METHOD_COPY[a.method]?.[locale] ?? a.method}</span>
            <span className="text-ink-3"> — {NOTE_COPY[a.note]?.[locale] ?? a.note}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
