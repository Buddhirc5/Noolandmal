import Link from "next/link";
import { loadCatalog } from "@/lib/server/catalog";
import { TableEditor, type Col } from "@/components/admin/TableEditor";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Catalog & prices" };

const TABS = [
  ["settings", "Settings"],
  ["palette", "Colours"],
  ["fabrics", "Fabrics"],
  ["options", "Add-on options"],
  ["groups", "Add-on groups"],
  ["rules", "Compatibility rules"],
  ["sizes", "Sizes"],
] as const;

export default async function CatalogPage({ searchParams }: PageProps<"/admin/catalog">) {
  const tab = ((await searchParams).tab as string) || "settings";
  const c = await loadCatalog();
  const groupKeys = c.groups.map((g) => g.key);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-green-900">Catalog &amp; prices</h1>
        <p className="mt-1 text-sm text-muted">Changes apply to the website immediately — no deploy needed. Saved designs keep the price they were saved with.</p>
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="Catalog sections">
        {TABS.map(([k, l]) => (
          <Link key={k} href={`/admin/catalog?tab=${k}`} className={`chip ${tab === k ? "chip-active" : ""}`} aria-current={tab === k ? "page" : undefined}>
            {l}
          </Link>
        ))}
      </nav>
      {tab === "settings" && <SettingsForm settings={c.settings} />}
      {tab === "palette" && (
        <TableEditor
          table="palette_colors"
          help="Curated swatches. Untick Active to hide a colour without deleting it."
          rows={c.palette}
          blank={{ key: "", name: "", hex: "#CE117D", sort: c.palette.length, active: true }}
          cols={[
            { key: "key", label: "Key", type: "text", width: "150px" },
            { key: "name", label: "Name", type: "text" },
            { key: "hex", label: "Colour", type: "color", width: "180px" },
            { key: "sort", label: "Order", type: "number", width: "90px" },
            { key: "active", label: "Active", type: "bool", width: "60px" },
          ] satisfies Col[]}
        />
      )}
      {tab === "fabrics" && (
        <TableEditor
          table="fabrics"
          help="Price modifier is added to the base price. Available colours: comma-separated colour keys, or empty for all colours."
          rows={c.fabrics}
          blank={{ key: "", name: "", note: "", price_modifier: 0, available_colors: null, sort: c.fabrics.length, active: true }}
          cols={[
            { key: "key", label: "Key", type: "text", width: "130px" },
            { key: "name", label: "Name", type: "text", width: "150px" },
            { key: "note", label: "Note", type: "text" },
            { key: "price_modifier", label: "+ LKR", type: "number", width: "100px" },
            { key: "available_colors", label: "Available colours", type: "list", placeholder: "all" },
            { key: "sort", label: "Order", type: "number", width: "70px" },
            { key: "active", label: "Active", type: "bool", width: "60px" },
          ] satisfies Col[]}
        />
      )}
      {tab === "options" && (
        <TableEditor
          table="addon_options"
          help='Price is added (or subtracted if negative). "per_metre" multiplies by the design&apos;s fabric metres. Layer (optional) changes the preview, e.g. {"slot":"sleeves","variant":"puff"} or {"slot":"extra","variant":"bow","region_key":"accent"}.'
          rows={c.options}
          blank={{ key: "", group_key: groupKeys[0], name: "", description: "", price: 0, price_type: "fixed", image_url: null, layer: null, sort: c.options.length, active: true }}
          cols={[
            { key: "key", label: "Key", type: "text", width: "150px" },
            { key: "group_key", label: "Group", type: "select", options: groupKeys, width: "120px" },
            { key: "name", label: "Name", type: "text", width: "180px" },
            { key: "description", label: "Description", type: "text" },
            { key: "price", label: "LKR", type: "number", width: "90px" },
            { key: "price_type", label: "Type", type: "select", options: ["fixed", "per_metre"], width: "110px" },
            { key: "layer", label: "Preview layer (JSON)", type: "json", width: "200px" },
            { key: "image_url", label: "Image URL", type: "text", width: "120px" },
            { key: "sort", label: "Order", type: "number", width: "70px" },
            { key: "active", label: "On", type: "bool", width: "40px" },
          ] satisfies Col[]}
        />
      )}
      {tab === "groups" && (
        <TableEditor
          table="addon_groups"
          help="Single = choose one; multi = choose any. Each design chooses which groups it offers."
          rows={c.groups}
          blank={{ key: "", name: "", description: "", selection: "single", sort: c.groups.length }}
          cols={[
            { key: "key", label: "Key", type: "text", width: "140px" },
            { key: "name", label: "Name", type: "text", width: "200px" },
            { key: "description", label: "Description", type: "text" },
            { key: "selection", label: "Selection", type: "select", options: ["single", "multi"], width: "110px" },
            { key: "sort", label: "Order", type: "number", width: "80px" },
          ] satisfies Col[]}
        />
      )}
      {tab === "rules" && (
        <TableEditor
          table="addon_rules"
          help="Two options that can't be combined. The reason is shown to the customer next to the disabled option."
          rows={c.rules}
          blank={{ option_a: "", option_b: "", reason: "" }}
          cols={[
            { key: "option_a", label: "Option A (key)", type: "select", options: c.options.map((o) => o.key), width: "220px" },
            { key: "option_b", label: "Option B (key)", type: "select", options: c.options.map((o) => o.key), width: "220px" },
            { key: "reason", label: "Reason shown to customer", type: "text" },
          ] satisfies Col[]}
        />
      )}
      {tab === "sizes" && (
        <TableEditor
          table="size_options"
          help="Size modifiers cover extra fabric for larger sizes."
          rows={c.sizes}
          blank={{ key: "", label: "", modifier: 0, note: "", sort: c.sizes.length }}
          cols={[
            { key: "key", label: "Key", type: "text", width: "110px" },
            { key: "label", label: "Label", type: "text", width: "120px" },
            { key: "modifier", label: "+ LKR", type: "number", width: "110px" },
            { key: "note", label: "Note", type: "text" },
            { key: "sort", label: "Order", type: "number", width: "80px" },
          ] satisfies Col[]}
        />
      )}
    </div>
  );
}
