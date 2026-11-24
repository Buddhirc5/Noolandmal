/* eslint-disable @next/next/no-img-element */
import type { DesignLayer } from "@/lib/types";

/**
 * Photo-based layers uploaded in admin. A layer with a colour region is tinted
 * by using the PNG's alpha as a CSS mask over the chosen colour, then the same
 * PNG is multiplied on top to keep folds and shading. Layers without a region
 * (e.g. a model/skin base) are drawn as-is.
 */
export function RasterPreview({ layers, colorOf }: { layers: DesignLayer[]; colorOf: (region: string) => string }) {
  return (
    <div className="absolute inset-0">
      {layers.map((l) =>
        l.region_key ? (
          <div key={l.id} className="absolute inset-0" style={{ opacity: l.opacity }}>
            <div
              className="absolute inset-0 transition-[background-color] duration-200"
              style={{
                backgroundColor: colorOf(l.region_key),
                WebkitMaskImage: `url(${l.image_url})`,
                maskImage: `url(${l.image_url})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
            />
            <img src={l.image_url!} alt="" className="absolute inset-0 size-full object-contain mix-blend-multiply" />
          </div>
        ) : (
          <img key={l.id} src={l.image_url!} alt="" className="absolute inset-0 size-full object-contain" style={{ opacity: l.opacity }} />
        ),
      )}
    </div>
  );
}
