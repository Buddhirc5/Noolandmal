"use client";
import { usePathname } from "next/navigation";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { useLocale } from "@/components/I18nProvider";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function WhatsAppFab() {
  const pathname = usePathname();
  const locale = useLocale();
  // the customiser has its own sticky bar with a WhatsApp action
  const onCustomiser = /^\/(collection\/[^/]+|d\/)/.test(pathname);
  const href = buildWhatsAppLink("enquiry", {}, { lang: locale === "si" ? "si" : "en" });
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => navigator.sendBeacon?.("/api/events", JSON.stringify({ type: "whatsapp_enquiry_click", path: pathname }))}
      className={`fixed right-4 z-30 size-14 items-center justify-center rounded-full bg-[#1f7a4d] text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105 md:right-6 md:bottom-6 ${onCustomiser ? "hidden md:inline-flex" : "inline-flex bottom-5"}`}
      aria-label="Chat with Nool & Mal on WhatsApp"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
