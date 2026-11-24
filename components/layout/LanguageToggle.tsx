"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { site, type Locale } from "@/config/site";
import { LOCALE_COOKIE, LOCALE_NAMES } from "@/lib/i18n";
import { useLocale, useT } from "@/components/I18nProvider";

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className={`inline-flex rounded-full border border-line bg-paper p-0.5 text-xs ${className ?? ""}`} role="group" aria-label={t("lang.label")}>
      {site.locales.map((l: Locale) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === locale}
          disabled={pending}
          onClick={() => {
            document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
            start(() => router.refresh());
          }}
          className={`min-h-8 rounded-full px-2.5 transition-colors ${l === locale ? "bg-green-900 text-white" : "text-ink hover:bg-green-50"}`}
        >
          {l === "en" ? "EN" : LOCALE_NAMES[l]}
        </button>
      ))}
    </div>
  );
}
