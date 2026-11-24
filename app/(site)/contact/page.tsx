import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { site } from "@/config/site";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact & studio location",
  description: `Visit the Nool & Mal studio at ${site.studio.street}, ${site.studio.city}, or message us on WhatsApp ${site.phoneDisplay}. Studio visits by appointment.`,
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  const embed = `https://maps.google.com/maps?q=${site.studio.lat},${site.studio.lng}&z=16&output=embed`;
  return (
    <div className="container-x py-12 md:py-16">
      <PageHeader eyebrow="Contact" title="Visit the *studio*" sub="WhatsApp is the fastest way to reach us. Measurements and fittings are by appointment." />
      <div className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]" data-reveal-stagger>
        <div className="space-y-4">
          <a href={waLink("Hi Nool & Mal, ")} target="_blank" rel="noopener noreferrer" className="card lift block p-6">
            <p className="text-[13px] text-muted">WhatsApp</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{site.phoneDisplay}</p>
            <p className="mt-1 text-sm text-muted">Usually replies within a few hours</p>
          </a>
          <a href={site.studio.mapUrl} target="_blank" rel="noopener noreferrer" className="card lift block p-6">
            <p className="text-[13px] text-muted">Studio</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-ink">{site.studio.street}</p>
            <p className="text-[15px] text-ink">{site.studio.city}</p>
            <p className="mt-2 text-sm text-muted">Plus code {site.studio.plusCode} · {site.studio.hours}</p>
            <p className="mt-3 text-sm font-medium text-pink">Get directions</p>
          </a>
          <Link href="/designer" className="card lift flex items-center gap-4 p-6">
            <span className="relative size-16 shrink-0 overflow-hidden rounded-full bg-surface">
              <Image src="/brand/roshini-shyama.webp" alt="" fill sizes="64px" className="object-cover object-top" />
            </span>
            <span>
              <span className="block text-[13px] text-muted">Designer</span>
              <span className="mt-0.5 block text-xl font-semibold tracking-tight text-ink">{site.designer}</span>
              <span className="mt-0.5 block text-sm text-muted">{site.designerYears} years · {site.designerPieces} pieces made</span>
            </span>
          </Link>
        </div>
        <div className="relative min-h-[360px] overflow-hidden rounded-[28px] bg-surface">
          <iframe title={`Map to ${site.studio.street}`} src={embed} className="absolute inset-0 size-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </div>
  );
}
