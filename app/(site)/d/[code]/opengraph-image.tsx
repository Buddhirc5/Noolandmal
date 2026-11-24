import { getDesignBundleById } from "@/lib/server/catalog";
import { getConfiguration } from "@/lib/server/orders";
import { designPhotoDataUri, ogCard, OG_SIZE } from "@/lib/server/og";
import { lkrRange } from "@/lib/format";
import { normalizeCode } from "@/lib/codes";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A Nool & Mal design";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const code = normalizeCode((await params).code);
  const config = await getConfiguration(code);
  const bundle = config ? await getDesignBundleById(config.design_id) : null;
  if (!config || !bundle) return ogCard({ eyebrow: "Nool & Mal", title: "Made-to-order dresses", subtitle: "Colombo, Sri Lanka" });
  return ogCard({
    eyebrow: `Design ${config.code}`,
    title: bundle.design.name,
    subtitle: `Estimated ${lkrRange(config.price_min, config.price_max)}`,
    image: await designPhotoDataUri(bundle, config.selections),
  });
}
