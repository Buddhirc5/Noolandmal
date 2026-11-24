import Image from "next/image";
import Link from "next/link";
import { colorHex, colorName } from "@/lib/colors";
import { lkr } from "@/lib/format";
import type { PaletteColor } from "@/lib/types";
import type { DesignCardData } from "@/lib/server/catalog";

export function DesignCard({ item, palette, priority = false, fromLabel = "from", headingLevel = "h3" }: { item: DesignCardData; palette: PaletteColor[]; priority?: boolean; fromLabel?: string; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const { design, regions } = item;
  const minFabric = item.fabrics.length ? Math.min(...item.fabrics.map((f) => f.price_modifier)) : 0;
  const photo = design.images[0];
  return (
    <Link href={`/collection/${design.slug}`} className="group card card-hover flex flex-col overflow-hidden p-2.5">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-surface-2">
        {photo ? (
          <Image
            src={photo}
            alt={`${design.name} — front view`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={70}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[13px] text-muted">Photos coming soon</span>
        )}
        {design.badge && <span className="badge absolute top-3 left-3 bg-paper/95">{design.badge}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-2.5 pt-4 pb-2">
        <Heading className="text-xl leading-tight font-semibold tracking-[-0.02em] text-ink">{design.name}</Heading>
        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {fromLabel} <span className="font-medium text-ink">{lkr(design.base_price + minFabric)}</span>
          </p>
          <div className="flex -space-x-1.5" aria-label={`Shown in ${regions.map((r) => colorName(r.default_color, palette)).join(", ")}`}>
            {regions.map((r) => (
              <span key={r.id} className="size-4 rounded-full border-2 border-surface ring-1 ring-black/10" style={{ background: colorHex(r.default_color, palette) }} />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
