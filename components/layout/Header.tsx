"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { navLinks } from "@/config/site";
import { useT } from "@/components/I18nProvider";
import { LanguageToggle } from "./LanguageToggle";

export function Header({ signedIn, accountsEnabled }: { signedIn: boolean; accountsEnabled: boolean }) {
  const t = useT();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
    <header
      className={`sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-200 ${
        scrolled ? "bg-ivory/80 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-ivory"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Link href="/" aria-label="Nool & Mal home" className="shrink-0">
          <Logo variant="horizontal" size={32} />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-2.5 py-2 text-sm transition-colors hover:text-green-900 ${active ? "text-green-900 font-medium" : "text-ink/75"}`}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <span className="hidden xl:block">
            <LanguageToggle />
          </span>
          <Link href={accountHref} className="btn-ghost px-3">
            {accountLabel}
          </Link>
          <Link href="/collection" className="btn-primary">
            {t("cta.start")}
          </Link>
        </div>
        <button type="button" className="btn-ghost -mr-2 px-3 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(true)}>
          <Menu className="size-5" aria-hidden />
          <span className="sr-only">Open menu</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-ink/30" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div id="mobile-nav" className="absolute inset-y-0 right-0 flex w-[min(88vw,360px)] animate-fade-up flex-col bg-ivory p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <Logo variant="horizontal" size={28} />
              <button type="button" className="btn-ghost -mr-2 px-3" onClick={() => setOpen(false)}>
                <X className="size-5" aria-hidden />
                <span className="sr-only">Close menu</span>
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-8 flex flex-col">
              {[...navLinks, { href: "/track", key: "nav.track" } as const].map((l) => (
                <Link key={l.href} href={l.href} className="border-b border-line py-4 font-serif text-2xl text-green-900">
                  {t(l.key)}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3 pt-8">
              <LanguageToggle className="self-start" />
              <Link href={accountHref} className="btn-secondary">
                {accountLabel}
              </Link>
              <Link href="/collection" className="btn-primary">
                {t("cta.start")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
