import Image from "next/image";
import Link from "next/link";
import { listDesignCards, loadCatalog } from "@/lib/server/catalog";
import { DesignQuick } from "@/components/admin/DesignQuick";
import { lkr } from "@/lib/format";

export const metadata = { title: "Designs" };

export default async function Designs() {
  const [cards, catalog] = await Promise.all([listDesignCards({ includeUnpublished: true }), loadCatalog()]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-green-900">Designs</h1>
          <p className="mt-1 text-sm text-muted">Order here is the order on the collection page.</p>
        </div>
        <Link href="/admin/designs/new" className="btn-primary">
          + New design
        </Link>
      </div>
      <div className="card divide-y divide-line">
        {cards.map(({ design }) => (
          <div key={design.id} className="flex flex-wrap items-center gap-4 p-3">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F5F5F7]">
              {design.images[0] ? (
                <Image src={design.images[0]} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-center text-[10px] leading-tight text-muted">No photo</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/designs/${design.id}`} className="font-medium text-green-900 hover:underline">
                {design.name}
              </Link>
              <p className="text-xs text-muted">
                {design.category} · base {lkr(design.base_price)} · {design.published ? "Published" : "Hidden"}
                {design.featured ? " · Featured" : ""}
                {design.versions.length ? ` · ${design.versions.length} version${design.versions.length > 1 ? "s" : ""}` : ""}
              </p>
            </div>
            <DesignQuick id={design.id} published={design.published} />
          </div>
        ))}
      </div>
    </div>
  );
}
