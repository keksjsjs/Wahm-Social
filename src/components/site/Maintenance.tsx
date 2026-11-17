import type { Bi } from "@/lib/site/types";
import type { Locale } from "@/lib/i18n";
import { LogoMark, Wordmark } from "../layout/Logo";

/** Full-page maintenance screen (admin panel stays reachable). */
export function Maintenance({ message, locale }: { message: Bi; locale: Locale }) {
  const text = message[locale] || message.ar || message.en;
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="card max-w-lg p-10 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <LogoMark size={40} />
          <Wordmark />
        </div>
        <div className="mb-3 text-4xl">🛠️</div>
        <p className="whitespace-pre-line text-lg leading-8 text-ink">{text}</p>
      </div>
    </main>
  );
}
