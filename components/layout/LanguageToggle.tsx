"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { site, type Locale } from "@/config/site";
import { LOCALE_COOKIE, LOCALE_NAMES } from "@/lib/i18n";
import { useLocale, useT } from "@/components/I18nProvider";

export function LanguageToggle({ className, dark = false }: { className?: string; dark?: boolean }) {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className={`inline-flex rounded-full border p-0.5 text-xs ${dark ? "border-white/20 bg-white/5" : "border-line bg-paper"} ${className ?? ""}`} role="group" aria-label={t("lang.label")}>
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
          className={`min-h-9 rounded-full px-3 transition-colors ${l === locale ? (dark ? "bg-white text-ink" : "bg-ink text-white") : dark ? "text-white/80 hover:bg-white/10" : "text-ink hover:bg-surface"}`}
        >
          {l === "en" ? "EN" : LOCALE_NAMES[l]}
        </button>
      ))}
    </div>
  );
}
