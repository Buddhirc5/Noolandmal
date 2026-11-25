"use client";
import { WishlistCount } from "@/components/wishlist/HeartButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { navLinks } from "@/config/site";
import { useT } from "@/components/I18nProvider";
import { LanguageToggle } from "./LanguageToggle";

/** Floating dark pill navigation (ceynk.lk style) in Nool & Mal colours. */
export function Header({ signedIn, accountsEnabled }: { signedIn: boolean; accountsEnabled: boolean }) {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const accountHref = signedIn || !accountsEnabled ? "/account" : "/login";
  const accountLabel = signedIn ? t("nav.account") : accountsEnabled ? t("nav.login") : t("nav.account");

  return (
    <header className="pointer-events-none sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`pointer-events-auto mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full bg-green-900/95 pr-2 pl-4 text-white backdrop-blur-md transition-shadow duration-200 sm:h-16 sm:pl-6 ${
          scrolled ? "shadow-[0_12px_32px_-12px_rgb(20_32_28/0.55)]" : ""
        }`}
      >
        <Link href="/" aria-label="Nool & Mal home" className="shrink-0">
          <Logo variant="mono" size={28} className="text-white [&_span]:text-[1.45rem]" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-[14px] whitespace-nowrap transition-colors hover:text-white ${active ? "bg-white/10 text-white" : "text-white/75"}`}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link href={accountHref} className="hidden rounded-full px-3 py-2 text-[15px] font-medium text-white hover:bg-white/10 sm:inline-flex">
            {accountLabel}
          </Link>
          <Link href="/wishlist" aria-label={t("nav.wishlist")} className="relative inline-flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 sm:size-11">
            <Heart className="size-5" aria-hidden />
            <WishlistCount />
          </Link>
          <Link href="/collection" className="btn-gold min-h-10 px-4 text-[14px] sm:min-h-11 sm:px-5 sm:text-[15px]">
            <span className="sm:hidden">{t("cta.short")}</span>
            <span className="hidden sm:inline">{t("cta.start")}</span>
          </Link>
          <button type="button" className="inline-flex size-11 items-center justify-center rounded-full text-white hover:bg-white/10 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(true)}>
            <Menu className="size-6" aria-hidden />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="pointer-events-auto fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-night/50 backdrop-blur-sm" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div id="mobile-nav" className="absolute inset-x-3 top-3 animate-fade-up rounded-[28px] bg-green-900 p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo variant="mono" size={26} className="text-white [&_span]:text-[1.4rem]" />
              <button type="button" className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/10" onClick={() => setOpen(false)}>
                <X className="size-6" aria-hidden />
                <span className="sr-only">Close menu</span>
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-6 flex flex-col">
              {[...navLinks, { href: "/track", key: "nav.track" } as const].map((l) => (
                <Link key={l.href} href={l.href} className="border-b border-white/10 py-4 text-2xl font-semibold tracking-tight">
                  {t(l.key)}
                </Link>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-3">
              <LanguageToggle dark className="self-start" />
              <div className="grid grid-cols-2 gap-2">
                <Link href={accountHref} className="btn border border-white/25 text-white hover:bg-white/10">
                  {accountLabel}
                </Link>
                <Link href="/collection" className="btn-gold">
                  {t("cta.start")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
