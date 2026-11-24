import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { getDict, isLocale, LOCALE_COOKIE } from "./i18n";
import type { Locale } from "@/config/site";

export const getLocale = cache(async (): Promise<Locale> => {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : "en";
});

export async function getT() {
  const dict = getDict(await getLocale());
  return (k: keyof typeof dict) => dict[k];
}
