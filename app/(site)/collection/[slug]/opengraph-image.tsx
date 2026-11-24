import { getDesignBundle, loadCatalog } from "@/lib/server/catalog";
import { dressSvgDataUri, ogCard, OG_SIZE } from "@/lib/server/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Nool & Mal design";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [bundle, catalog] = await Promise.all([getDesignBundle(slug), loadCatalog()]);
  if (!bundle) return ogCard({ eyebrow: "Nool & Mal", title: "Made-to-order dresses", subtitle: "Colombo, Sri Lanka" });
  return ogCard({
    eyebrow: "Customise your dress",
    title: bundle.design.name,
    subtitle: `From LKR ${bundle.design.base_price.toLocaleString("en-LK")} · made to order`,
    image: dressSvgDataUri(bundle, catalog),
  });
}
