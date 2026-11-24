import "server-only";
import { ImageResponse } from "next/og";
import { buildFigure, figureToSvg, resolveLayers } from "@/lib/figure";
import { colorHex, SHEEN } from "@/lib/colors";
import { flowerSvg } from "@/components/brand/flower";
import type { Catalog, DesignBundle, LayerSpec, Selections } from "@/lib/types";

export const OG_SIZE = { width: 1200, height: 630 };

export function dressSvgDataUri(bundle: DesignBundle, catalog: Catalog, sel?: Selections): string {
  const colors = sel?.colors ?? Object.fromEntries(bundle.regions.map((r) => [r.key, r.default_color]));
  const overrides = (sel?.options ?? bundle.design.default_options).map((k) => catalog.options.find((o) => o.key === k)?.layer).filter(Boolean) as LayerSpec[];
  const layers = resolveLayers(
    bundle.layers.filter((l) => !l.image_url).map((l) => ({ slot: l.slot, variant: l.variant, region_key: l.region_key })),
    overrides,
    bundle.regions.map((r) => r.key),
  );
  const svg = figureToSvg(buildFigure(layers), (r) => colorHex(colors[r], catalog.palette), { sheen: SHEEN[sel?.fabric ?? bundle.design.default_fabric] });
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function ogCard({ eyebrow, title, subtitle, image }: { eyebrow: string; title: string; subtitle: string; image?: string }) {
  const logo = `data:image/svg+xml;base64,${Buffer.from(flowerSvg(64)).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F8F5F0", fontFamily: "serif" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width={56} height={56} alt="" />
            <span style={{ fontSize: 36, color: "#1F4D40" }}>Nool &amp; Mal</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 22, letterSpacing: 6, color: "#2F6B5A", textTransform: "uppercase" }}>{eyebrow}</span>
            <span style={{ fontSize: 68, lineHeight: 1.05, color: "#1F4D40", marginTop: 16 }}>{title}</span>
            <span style={{ fontSize: 30, color: "#5F6E69", marginTop: 20 }}>{subtitle}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#1F4D40", fontSize: 24 }}>
            <div style={{ width: 80, height: 2, background: "#C9A66B" }} />
            Made to order · Sri Lanka
          </div>
        </div>
        {image && (
          <div style={{ width: 420, display: "flex", alignItems: "center", justifyContent: "center", background: "#F1ECE4" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} width={300} height={600} alt="" />
          </div>
        )}
      </div>
    ),
    OG_SIZE,
  );
}
