import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Privacy notice", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <div className="container-x max-w-3xl py-12 md:py-16">
      <PageHeader eyebrow="Privacy" title="Privacy notice" sub="What we collect, why, and how long we keep it. (Draft — have this reviewed before launch.)" />
      <div className="prose-nm mt-10">
        <h2>What we collect</h2>
        <ul>
          <li>Your design choices and the code we generate for them.</li>
          <li>Your name and WhatsApp number if you give them, so we can quote and update you.</li>
          <li>Reference photos and links you send with a custom request, and payment slips you upload.</li>
          <li>An anonymous device cookie so your designs are saved without an account, and an optional account email if you log in.</li>
        </ul>
        <h2>How we protect it</h2>
        <ul>
          <li>Photos and slips are stored privately. Only Roshini, or someone holding your private link, can view them, and links expire after a few minutes.</li>
          <li>We remove location data (EXIF GPS) from uploaded photos.</li>
          <li>We never sell your data or use your photos publicly without asking.</li>
        </ul>
        <h2>How long we keep it</h2>
        <p>Order records are kept for accounting. Reference photos and slips are deleted 12 months after an order is completed or a request goes inactive. Ask us on WhatsApp to delete your data at any time.</p>
        <h2>WhatsApp</h2>
        <p>When you tap a WhatsApp button, your message is sent by you through WhatsApp and is subject to WhatsApp&apos;s own privacy policy.</p>
      </div>
    </div>
  );
}
