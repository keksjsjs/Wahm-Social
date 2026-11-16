"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "../I18nProvider";

export function LogoutButton() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <button
      className="btn-ghost"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      {t.nav.logout}
    </button>
  );
}

export function CancelButton() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <button
      className="btn-ghost btn-sm"
      onClick={async () => {
        await fetch("/api/billing/cancel", { method: "POST" });
        router.refresh();
      }}
    >
      {t.account.cancel}
    </button>
  );
}

export function ApiKeyButton({ initial }: { initial?: string }) {
  const { t } = useI18n();
  const [key, setKey] = useState(initial ?? "");
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="flex-1 truncate rounded-lg bg-surface px-3 py-2 text-xs text-accent-600 dark:text-accent-300" dir="ltr">
        {key || "—"}
      </code>
      <button
        className="btn-ghost btn-sm"
        onClick={async () => {
          const r = await fetch("/api/account/apikey", { method: "POST" });
          const j = await r.json();
          if (j.ok) setKey(j.data.apiKey);
        }}
      >
        {t.account.generate}
      </button>
    </div>
  );
}
