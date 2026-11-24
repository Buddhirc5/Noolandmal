import type { Metadata } from "next";
import { CustomRequestForm } from "@/components/custom/CustomRequestForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChatMock } from "@/components/home/Mockups";

export const metadata: Metadata = {
  title: "Custom request — send us your dream dress",
  description: "Can't find your dream design? Paste an Instagram or Pinterest link or upload photos. Nool & Mal will quote it on WhatsApp and make it to order in Sri Lanka.",
  alternates: { canonical: "/custom" },
};

export default function CustomPage() {
  return (
    <div className="container-x py-10 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <SectionHeading as="h1" eyebrow="Custom request" title="Can't find your dream design?" sub="Show us what you love — a link, a screenshot or a photo — and we'll make it for you. You'll get a request code and we'll reply with ideas and a quotation on WhatsApp." />
          <div className="mt-10">
            <CustomRequestForm />
          </div>
        </div>
        <aside className="space-y-5 lg:pt-36">
          <div className="card p-5">
            <p className="eyebrow">What happens next</p>
            <ol className="mt-4 space-y-4 text-sm">
              {[
                ["You get a code", "Like CR-3M9XA. Your photos are saved with it."],
                ["WhatsApp opens", "With your request ready to send."],
                ["We reply with a quote", "Usually within a day, with fabric ideas."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="font-serif text-2xl leading-none text-gold-600">{i + 1}</span>
                  <span>
                    <b className="font-medium text-green-900">{t}</b>
                    <br />
                    <span className="text-muted">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <ChatMock />
        </aside>
      </div>
    </div>
  );
}
