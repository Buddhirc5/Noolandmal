import Link from "next/link";
import { notFound } from "next/navigation";
import { DesignEditor } from "@/components/admin/DesignEditor";
import { getDesignBundleById, listDesigns, loadCatalog } from "@/lib/server/catalog";

export const metadata = { title: "Edit design" };

export default async function EditDesign({ params }: PageProps<"/admin/designs/[id]">) {
  const { id } = await params;
  const catalog = await loadCatalog();
  if (id === "new") {
    const count = (await listDesigns({ includeUnpublished: true })).length;
    return (
      <div className="space-y-6">
        <Link href="/admin/designs" className="text-sm text-muted hover:text-green-900">
          ← Designs
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight text-green-900">New design</h1>
        <DesignEditor
          id={null}
          catalog={catalog}
          design={{
            slug: "",
            name: "",
            category: "dress",
            occasions: [],
            description: "",
            base_price: 10000,
            fabric_metres: 3,
            default_fabric: "cotton",
            fabric_keys: ["cotton"],
            addon_groups: ["neckline", "sleeves", "length", "lining"],
            default_options: [],
            images: [],
            published: false,
            featured: false,
            sort: count,
            badge: null,
          }}
          regions={[
            { key: "main", label: "Main fabric", default_color: "deep-green", sort: 0 },
            { key: "accent", label: "Accent", default_color: "gold", sort: 1 },
          ]}
          layers={[
            { slot: "bodice", variant: "v-neck", region_key: "main", z: 0, image_url: null, opacity: 1 },
            { slot: "skirt", variant: "aline", region_key: "main", z: 1, image_url: null, opacity: 1 },
            { slot: "length", variant: "midi", region_key: "main", z: 2, image_url: null, opacity: 1 },
          ]}
        />
      </div>
    );
  }
  const b = await getDesignBundleById(id);
  if (!b) notFound();
  const { id: _id, created_at: _c, updated_at: _u, ...design } = b.design;
  void _id; void _c; void _u;
  return (
    <div className="space-y-6">
      <Link href="/admin/designs" className="text-sm text-muted hover:text-green-900">
        ← Designs
      </Link>
      <h1 className="text-4xl font-semibold tracking-tight text-green-900">{b.design.name}</h1>
      <DesignEditor
        id={b.design.id}
        catalog={catalog}
        design={design}
        regions={b.regions.map(({ key, label, default_color, sort }) => ({ key, label, default_color, sort }))}
        layers={b.layers.map(({ slot, variant, region_key, z, image_url, opacity }) => ({ slot, variant, region_key, z, image_url, opacity }))}
      />
    </div>
  );
}
