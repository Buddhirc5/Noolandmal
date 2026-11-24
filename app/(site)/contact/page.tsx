import type { Metadata } from "next";
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
          <div className="card p-6">
            <p className="text-[13px] text-muted">Designer</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-ink">{site.designer}</p>
            <p className="mt-1 text-sm text-muted">Fashion design and crochet</p>
          </div>
        </div>
        <div className="relative min-h-[360px] overflow-hidden rounded-[28px] bg-surface">
          <iframe title={`Map to ${site.studio.street}`} src={embed} className="absolute inset-0 size-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </div>
  );
}
