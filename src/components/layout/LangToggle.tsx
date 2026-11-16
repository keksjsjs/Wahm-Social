"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useI18n } from "../I18nProvider";

export function LangToggle() {
  const { locale } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const next = locale === "ar" ? "en" : "ar";
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        await fetch("/api/lang", { method: "POST", body: JSON.stringify({ locale: next }) });
        start(() => router.refresh());
      }}
      className="btn-ghost btn-sm"
      aria-label="Switch language"
    >
      {next === "en" ? "EN" : "عربي"}
    </button>
  );
}
