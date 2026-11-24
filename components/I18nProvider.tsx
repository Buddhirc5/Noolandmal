"use client";
import { createContext, useContext } from "react";
import type { Dict, MessageKey } from "@/lib/i18n";
import type { Locale } from "@/config/site";

const Ctx = createContext<{ dict: Dict; locale: Locale } | null>(null);

export function I18nProvider({ dict, locale, children }: { dict: Dict; locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={{ dict, locale }}>{children}</Ctx.Provider>;
}

export function useT() {
  const c = useContext(Ctx);
  return (k: MessageKey) => c?.dict[k] ?? k;
}

export function useLocale(): Locale {
  return useContext(Ctx)?.locale ?? "en";
}
