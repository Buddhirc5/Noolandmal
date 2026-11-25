/* eslint-disable @next/next/no-img-element */
import { listGallery } from "@/lib/server/gallery";
import { listDesigns } from "@/lib/server/catalog";
import { GalleryEditor } from "@/components/admin/GalleryEditor";

export const metadata = { title: "Gallery" };

export default async function AdminGallery() {
  const [items, designs] = await Promise.all([listGallery({ all: true }), listDesigns({ includeUnpublished: true })]);
  const ds = designs.map((d) => ({ slug: d.slug, name: d.name }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-green-900 md:text-4xl">Gallery</h1>
        <p className="mt-1 text-sm text-muted">Finished pieces shown on /gallery. Only share customer photos with their permission.</p>
      </div>
      <section className="card p-5">
        <h2 className="mb-4 font-semibold text-green-900">Add a finished piece</h2>
        <GalleryEditor designs={ds} />
      </section>
      <section className="space-y-3">
        {items.map((g) => (
          <details key={g.id} className="card p-4">
            <summary className="flex cursor-pointer list-none items-center gap-3">
              <img src={g.images[0]} alt="" className="h-16 w-12 shrink-0 rounded-[10px] object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{g.title}</span>
                <span className="text-xs text-muted">
                  {g.images.length} photo{g.images.length === 1 ? "" : "s"} · {g.published ? "on the website" : "hidden"}
                  {g.featured ? " · featured" : ""}
                </span>
              </span>
            </summary>
            <div className="mt-4 border-t border-line pt-4">
              <GalleryEditor initial={g} designs={ds} />
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
