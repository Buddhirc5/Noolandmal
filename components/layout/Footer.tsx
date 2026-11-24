import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/config/site";
import { getT } from "@/lib/i18n-server";
import { LanguageToggle } from "./LanguageToggle";

/** Dark footer revealed from under the page on desktop, with a giant wordmark (ceynk.lk style). */
export async function Footer() {
  const t = await getT();
  const cols = [
    { title: t("footer.shop"), links: [["/collection", t("nav.collection")], ["/custom", t("nav.custom")], ["/pricing", t("nav.pricing")], ["/guides", "Guides"]] },
    { title: t("footer.help"), links: [["/how-it-works", t("nav.how")], ["/faq", t("nav.faq")], ["/track", t("nav.track")], ["/contact", "Contact"]] },
    { title: t("footer.company"), links: [["/#story", "Our story"], ["/terms", "Terms"], ["/privacy", "Privacy"], ["/account", t("nav.account")]] },
  ];
  return (
    <footer className="z-0 overflow-hidden bg-ink text-white md:sticky md:bottom-0">
      <div className="container-x grid gap-12 pt-16 pb-10 md:grid-cols-[1.2fr_2fr]">
        <div>
          <Logo variant="mono" size={34} className="text-white [&_span]:text-[1.7rem]" />
          <p className="mt-5 max-w-xs text-sm leading-6 text-white/65">
            Made to order in Sri Lanka. Designed by {site.designer} and sewn by hand in our Kotte studio.
          </p>
          <address className="mt-6 text-sm leading-6 text-white/80 not-italic">
            {site.studio.street}
            <br />
            {site.studio.city}
            <br />
            <a href={site.studio.mapUrl} target="_blank" rel="noopener noreferrer" className="text-pink-light underline-offset-4 hover:underline">
              Open in Google Maps
            </a>
          </address>
          <div className="mt-6 flex flex-wrap gap-2">
            <a className="btn bg-pink px-5 text-white hover:bg-orchid" href={`https://wa.me/${site.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
              WhatsApp {site.phoneDisplay}
            </a>
            <a className="btn border border-white/20 px-5 text-white hover:bg-white/10" href={site.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {cols.map((c) => (
            <div key={c.title}>
              <h2 className="text-[12px] font-medium tracking-[0.16em] text-white/50 uppercase">{c.title}</h2>
              <ul className="mt-4 space-y-3 text-[15px]">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-white/85 transition-colors hover:text-pink-light">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="container-x flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Nool &amp; Mal · {site.studio.hours}
        </p>
        <LanguageToggle dark />
      </div>
      <p aria-hidden className="pointer-events-none -mb-[0.22em] text-center font-logo text-[21vw] leading-[0.9] font-semibold tracking-tight whitespace-nowrap text-white/[0.07] select-none">
        Nool &amp; Mal
      </p>
    </footer>
  );
}
