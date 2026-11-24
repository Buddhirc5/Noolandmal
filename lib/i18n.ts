import en, { type MessageKey } from "@/messages/en";
import si from "@/messages/si";
import ta from "@/messages/ta";
import type { Locale } from "@/config/site";

export type { MessageKey };
export const LOCALE_COOKIE = "nm_lang";
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", si: "සිංහල", ta: "தமிழ்" };
const dicts: Record<Locale, Partial<Record<MessageKey, string>>> = { en, si, ta };

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "si" || v === "ta";
}

export type Dict = Record<MessageKey, string>;

export function getDict(locale: Locale): Dict {
  return { ...en, ...dicts[locale] } as Dict;
}
