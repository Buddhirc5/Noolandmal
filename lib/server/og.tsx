import "server-only";
import { ImageResponse } from "next/og";
import { flowerSvg } from "@/components/brand/flower";
import sharp from "sharp";
import { site } from "@/config/site";
import type { DesignBundle, Selections } from "@/lib/types";

export const OG_SIZE = { width: 1200, height: 630 };

/** First photo of the design (version/colour aware), converted to a PNG data URI for the OG renderer. */
export async function designPhotoDataUri(bundle: DesignBundle, sel?: Selections): Promise<string | undefined> {
  const { design } = bundle;
  const version = sel?.version ? design.versions.find((v) => v.key === sel.version) : undefined;
  const main = sel?.colors?.main;
  const src = version?.images[0] ?? (main ? design.color_images[main]?.[0] : undefined) ?? design.images[0];
  if (!src) return undefined;
  try {
    const res = await fetch(new URL(src, site.url));
    if (!res.ok) return undefined;
    const png = await sharp(Buffer.from(await res.arrayBuffer())).resize(420, 630, { fit: "cover", position: "top" }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export function ogCard({ eyebrow, title, subtitle, image }: { eyebrow: string; title: string; subtitle: string; image?: string }) {
  const logo = `data:image/svg+xml;base64,${Buffer.from(flowerSvg(64)).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFFFFF", fontFamily: "serif" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} width={56} height={56} alt="" />
            <span style={{ fontSize: 36, color: "#0A0A0A" }}>Nool &amp; Mal</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 22, letterSpacing: 6, color: "#CE117D", textTransform: "uppercase" }}>{eyebrow}</span>
            <span style={{ fontSize: 68, lineHeight: 1.05, color: "#0A0A0A", marginTop: 16 }}>{title}</span>
            <span style={{ fontSize: 30, color: "#5E5E66", marginTop: 20 }}>{subtitle}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#0A0A0A", fontSize: 24 }}>
            <div style={{ width: 80, height: 2, background: "#CE117D" }} />
            Made to order · Sri Lanka
          </div>
        </div>
        {image && (
          <div style={{ width: 420, display: "flex", background: "#F5F5F7" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} width={420} height={630} alt="" style={{ objectFit: "cover" }} />
          </div>
        )}
      </div>
    ),
    OG_SIZE,
  );
}
