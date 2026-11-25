import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Your wishlist", robots: { index: false, follow: true }, alternates: { canonical: "/wishlist" } };

export default function Wishlist() {
  return (
    <div className="container-x py-12 md:py-16">
      <PageHeader eyebrow="Wishlist" title="Your *saved* designs" sub="Keep the designs and colours you love, then send them all on WhatsApp for one quotation." />
      <WishlistView siteUrl={site.url} />
    </div>
  );
}
