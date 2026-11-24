import Image from "next/image";
import Link from "next/link";
import { DressFigure } from "@/components/customiser/DressFigure";
import { colorHex, colorName } from "@/lib/colors";
import { lkr } from "@/lib/format";
import type { PaletteColor } from "@/lib/types";
import type { DesignCardData } from "@/lib/server/catalog";

export function DesignCard({ item, palette, priority = false, fromLabel = "from" }: { item: DesignCardData; palette: PaletteColor[]; priority?: boolean; fromLabel?: string }) {
  const { design, regions, layers } = item;
  const minFabric = item.fabrics.length ? Math.min(...item.fabrics.map((f) => f.price_modifier)) : 0;
  const colorOf = (key: string) => colorHex(regions.find((r) => r.key === key)?.default_color, palette);
  const photo = design.images[0];
  return (
    <Link href={`/collection/${design.slug}`} className="group card card-hover flex flex-col overflow-hidden">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F1ECE4]">
        {photo ? (
          <Image
            src={photo}
            alt={`${design.name} — front view`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <DressFigure layers={layers} colorOf={colorOf} className="absolute inset-0 m-auto h-[92%] w-full" title={`${design.name} preview`} idPrefix={`c-${design.slug}`} />
        )}
        {design.badge && <span className="badge absolute top-3 left-3 bg-paper/95">{design.badge}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-serif text-xl leading-tight font-semibold text-green-900">{design.name}</h3>
        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {fromLabel} <span className="font-medium text-ink">{lkr(design.base_price + minFabric)}</span>
          </p>
          <div className="flex -space-x-1.5" aria-label={`Shown in ${regions.map((r) => colorName(r.default_color, palette)).join(", ")}`}>
            {regions.map((r) => (
              <span key={r.id} className="size-4 rounded-full border-2 border-paper ring-1 ring-line" style={{ background: colorHex(r.default_color, palette) }} />
            ))}
            <span className="ml-2 pl-2 text-xs text-muted">+{palette.length - regions.length}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
