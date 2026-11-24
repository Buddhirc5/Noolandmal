import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { site } from "@/config/site";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Nool & Mal in Colombo on WhatsApp or by phone. Studio visits by appointment.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <div className="container-x py-12 md:py-16">
      <PageHeader eyebrow="Contact" title="Talk to us" sub="WhatsApp is the fastest way to reach us. Studio visits are by appointment." />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <a href={waLink("Hi Nool & Mal")} target="_blank" rel="noopener noreferrer" className="card card-hover p-6">
          <p className="text-lg font-semibold tracking-tight text-ink">WhatsApp</p>
          <p className="text-sm text-muted">Usually replies within a few hours</p>
        </a>
        <a href={`tel:+${site.whatsappNumber}`} className="card card-hover p-6">
          <p className="text-lg font-semibold tracking-tight text-ink">{site.phoneDisplay}</p>
          <p className="text-sm text-muted">Call during studio hours</p>
        </a>
        <a href={site.studio.mapUrl} target="_blank" rel="noopener noreferrer" className="card card-hover p-6">
          <p className="text-lg font-semibold tracking-tight text-ink">{site.studio.street}</p>
          <p className="text-sm text-muted">{site.studio.city}, Sri Lanka · open map</p>
        </a>
      </div>
      <p className="mt-6 flex items-center gap-2 text-sm text-muted">
        {site.studio.hours}
      </p>
    </div>
  );
}
