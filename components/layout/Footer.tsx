import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/config/site";
import { getT } from "@/lib/i18n-server";
import { LanguageToggle } from "./LanguageToggle";

export async function Footer() {
  const t = await getT();
  const cols = [
    { title: t("footer.shop"), links: [["/collection", t("nav.collection")], ["/custom", t("nav.custom")], ["/pricing", t("nav.pricing")], ["/guides", "Guides"]] },
    { title: t("footer.help"), links: [["/how-it-works", t("nav.how")], ["/faq", t("nav.faq")], ["/track", t("nav.track")], ["/contact", "Contact"]] },
    { title: t("footer.company"), links: [["/#story", "Our story"], ["/terms", "Terms"], ["/privacy", "Privacy"], ["/account", t("nav.account")]] },
  ];
  return (
    <footer className="mt-24 border-t border-line bg-paper">
      <div className="container-x grid gap-12 py-14 md:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo variant="full" size={44} className="text-[15px]" />
          <p className="mt-6 max-w-xs text-sm leading-6 text-muted">{t("footer.made")} Every piece is cut and sewn by hand after you order.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a className="btn-wa" href={`https://wa.me/${site.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a className="btn-secondary" href={site.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a className="btn-ghost" href={`tel:+${site.whatsappNumber}`}>
              {site.phoneDisplay}
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {cols.map((c) => (
            <div key={c.title}>
              <h2 className="eyebrow">{c.title}</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-ink/80 hover:text-green-900">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Nool &amp; Mal. {site.tagline}.</p>
          <div className="flex flex-wrap items-center gap-4">
            <p>{site.studio.city}, Sri Lanka · {site.studio.hours}</p>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
