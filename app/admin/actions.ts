"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminLogout, requireAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { putFile, publicUrl } from "@/lib/server/storage";
import { processImage, UploadError } from "@/lib/server/images";
import { audit, generateSlots, getOrder, issueQuote, reviewPayment, setStatus, ServiceError } from "@/lib/server/orders";
import { loadSettings } from "@/lib/server/catalog";
import { ORDER_STATUSES, type Design, type DesignRegion, type Order, type Settings } from "@/lib/types";
import { normalizePhone } from "@/lib/format";
import { ensureCustomer } from "@/lib/server/customers";

type Result = { ok: true; message?: string; data?: unknown } | { ok: false; error: string };
const fail = (e: unknown): Result => ({ ok: false, error: e instanceof ServiceError || e instanceof UploadError || e instanceof z.ZodError ? (e instanceof z.ZodError ? e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : e.message) : "Unexpected error" });
const refresh = () => revalidatePath("/", "layout");

export async function logoutAction() {
  await adminLogout();
  redirect("/admin/login");
}

// ── Orders ──────────────────────────────────────────────────────────────
const orderPatch = z.object({
  code: z.string(),
  customer_name: z.string().trim().max(80),
  customer_phone: z.string().trim().max(20),
  internal_notes: z.string().max(4000),
  fulfilment: z.enum(["pickup", "delivery"]),
  district: z.string().max(60).nullable(),
  delivery_address: z.string().max(400).nullable(),
});

export async function updateOrderAction(input: z.input<typeof orderPatch>): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const v = orderPatch.parse(input);
    const order = await getOrder(v.code);
    if (!order) throw new ServiceError("Order not found", 404);
    const { code: _code, ...patch } = v;
    void _code;
    await db.update<Order>("orders", { id: order.id }, { ...patch, customer_phone: v.customer_phone ? normalizePhone(v.customer_phone) : "" });
    if (v.customer_phone) await ensureCustomer(v.customer_phone, v.customer_name);
    await audit(actor, "order.update", "order", order.code, {});
    refresh();
    return { ok: true, message: "Saved" };
  } catch (e) {
    return fail(e);
  }
}

export async function setStatusAction(code: string, status: string): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const s = z.enum(ORDER_STATUSES).parse(status);
    const order = await getOrder(code);
    if (!order) throw new ServiceError("Order not found", 404);
    await setStatus(order, s, actor);
    await audit(actor, "order.status", "order", code, { from: order.status, to: s });
    refresh();
    return { ok: true, message: `Status → ${s.replace(/_/g, " ")}` };
  } catch (e) {
    return fail(e);
  }
}

const quoteInput = z.object({
  code: z.string(),
  amount: z.number().int().min(0).max(10_000_000),
  advancePercent: z.number().min(0).max(100),
  deliveryFee: z.number().int().min(0).max(100_000),
  validDays: z.number().int().min(1).max(90),
  note: z.string().max(1000),
  fulfilment: z.enum(["pickup", "delivery"]),
  district: z.string().max(60).nullable(),
});

export async function issueQuoteAction(input: z.input<typeof quoteInput>): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const v = quoteInput.parse(input);
    const order = await getOrder(v.code);
    if (!order) throw new ServiceError("Order not found", 404);
    const q = await issueQuote(order, v, actor);
    refresh();
    return { ok: true, message: "Quote issued", data: q };
  } catch (e) {
    return fail(e);
  }
}

export async function reviewPaymentAction(paymentId: string, approve: boolean, reason: string): Promise<Result> {
  const actor = await requireAdmin();
  try {
    await reviewPayment(paymentId, approve, reason.slice(0, 300) || null, actor);
    refresh();
    return { ok: true, message: approve ? "Payment approved" : "Payment rejected" };
  } catch (e) {
    return fail(e);
  }
}

// ── Catalogue tables ────────────────────────────────────────────────────
const key = z.string().regex(/^[a-z0-9-]{1,40}$/, "Use lowercase letters, numbers and dashes");
const list = z.array(key).nullable();
const tableSchemas = {
  palette_colors: z.object({ key, name: z.string().min(1).max(40), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/), sort: z.number().int(), active: z.boolean() }),
  fabrics: z.object({ key, name: z.string().min(1).max(60), note: z.string().max(200), price_modifier: z.number().int(), available_colors: list, sort: z.number().int(), active: z.boolean() }),
  addon_groups: z.object({ key, name: z.string().min(1).max(60), description: z.string().max(200), selection: z.enum(["single", "multi"]), sort: z.number().int() }),
  addon_options: z.object({
    key,
    group_key: key,
    name: z.string().min(1).max(80),
    description: z.string().max(200),
    price: z.number().int(),
    price_type: z.enum(["fixed", "per_metre"]),
    image_url: z.string().max(500).nullable(),
    sort: z.number().int(),
    active: z.boolean(),
  }),
  addon_rules: z.object({ option_a: key, option_b: key, reason: z.string().min(1).max(200) }),
  size_options: z.object({ key: z.string().regex(/^[A-Za-z0-9-]{1,12}$/), label: z.string().min(1).max(20), modifier: z.number().int(), note: z.string().max(120), sort: z.number().int() }),
} as const;
export type CatalogTable = keyof typeof tableSchemas;

export async function saveCatalogRowAction(table: CatalogTable, id: string | null, row: Record<string, unknown>): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const schema = tableSchemas[table];
    if (!schema) throw new ServiceError("Unknown table");
    const v = schema.parse(row) as Record<string, unknown>;
    if ("key" in v) {
      const clash = await db.get<{ id: string }>(table, { key: v.key as string });
      if (clash && clash.id !== id) throw new ServiceError(`Key "${v.key}" already exists`);
    }
    const saved = id ? (await db.update(table, { id }, v))[0] : await db.insert(table, v);
    await audit(actor, id ? "catalog.update" : "catalog.create", table, (saved as { id: string }).id, v);
    refresh();
    return { ok: true, message: "Saved", data: saved };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCatalogRowAction(table: CatalogTable, id: string): Promise<Result> {
  const actor = await requireAdmin();
  if (!(table in tableSchemas)) return { ok: false, error: "Unknown table" };
  await db.remove(table, { id });
  await audit(actor, "catalog.delete", table, id);
  refresh();
  return { ok: true, message: "Deleted" };
}

const settingsSchema = z.object({
  range_percent: z.number().min(0).max(50),
  custom_color_fee: z.number().int().min(0),
  standard_lead_days: z.number().int().min(1).max(180),
  rush_min_days: z.number().int().min(0).max(180),
  rush_fee_percent: z.number().min(0).max(200),
  advance_percent: z.number().min(0).max(100),
  quote_valid_days: z.number().int().min(1).max(90),
  weekly_capacity: z.number().int().min(1).max(200),
  max_quantity: z.number().int().min(1).max(200),
  bank: z.object({ accountName: z.string().max(80), bank: z.string().max(80), branch: z.string().max(80), accountNumber: z.string().max(40) }),
  delivery_fees: z.array(z.object({ district: z.string().min(1).max(60), fee: z.number().int().min(0) })).max(40),
});

export async function saveSettingsAction(input: Settings): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const v = settingsSchema.parse(input);
    const existing = await db.get("price_settings", { id: 1 });
    if (existing) await db.update("price_settings", { id: 1 }, { data: v });
    else await db.insert("price_settings", { id: 1, data: v });
    await audit(actor, "settings.update", "price_settings", "1", v);
    refresh();
    return { ok: true, message: "Settings saved — prices on the site update immediately." };
  } catch (e) {
    return fail(e);
  }
}

// ── Measurement slots ───────────────────────────────────────────────────
const slotTemplate = z.array(z.object({ weekday: z.number().int().min(0).max(6), time: z.string().regex(/^\d{2}:\d{2}$/), mode: z.enum(["studio", "home"]), capacity: z.number().int().min(1).max(10) })).min(1).max(40);

export async function generateSlotsAction(template: z.input<typeof slotTemplate>, weeks: number): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const n = await generateSlots(slotTemplate.parse(template), Math.min(12, Math.max(1, Math.floor(weeks))), actor);
    refresh();
    return { ok: true, message: `${n} slots created` };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteSlotAction(id: string): Promise<Result> {
  const actor = await requireAdmin();
  const booked = await db.list("measurement_bookings", { eq: { slot_id: id, status: "booked" } });
  if (booked.length) return { ok: false, error: "This slot has a booking. Move the customer first." };
  await db.remove("measurement_slots", { id });
  await audit(actor, "slots.delete", "measurement_slots", id);
  refresh();
  return { ok: true, message: "Slot removed" };
}

// ── Designs ─────────────────────────────────────────────────────────────
const designSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{2,80}$/, "Slug: lowercase letters, numbers and dashes"),
  name: z.string().min(2).max(80),
  category: z.string().min(1).max(40),
  occasions: z.array(z.string().max(30)).max(12),
  description: z.string().max(1200),
  base_price: z.number().int().min(0),
  fabric_metres: z.number().min(0).max(30),
  default_fabric: key,
  fabric_keys: z.array(key).min(1, "Choose at least one fabric"),
  addon_groups: z.array(key),
  default_options: z.array(key),
  images: z.array(z.string().max(500)).max(12),
  versions: z
    .array(
      z.object({
        key,
        name: z.string().trim().min(1).max(60),
        price: z.number().int(),
        images: z.array(z.string().max(500)).max(12),
        color_images: z.record(z.string().regex(/^[a-z0-9-]{1,40}$/), z.array(z.string().max(500)).max(12)).optional(),
      }),
    )
    .max(30)
    .default([]),
  color_images: z.record(z.string().regex(/^[a-z0-9-]{1,40}$/), z.array(z.string().max(500)).max(12)).default({}),
  published: z.boolean(),
  featured: z.boolean(),
  sort: z.number().int(),
  badge: z.string().max(20).nullable(),
});
const regionSchema = z.array(z.object({ key, label: z.string().min(1).max(40), default_color: z.string().min(1).max(40), sort: z.number().int() })).min(1);

export async function saveDesignAction(
  id: string | null,
  design: z.input<typeof designSchema>,
  regions: z.input<typeof regionSchema>,
): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const d = designSchema.parse(design);
    if (!d.fabric_keys.includes(d.default_fabric)) throw new ServiceError("Default fabric must be one of the allowed fabrics");
    if (new Set(d.versions.map((v) => v.key)).size !== d.versions.length) throw new ServiceError("Two versions have the same key");
    const r = regionSchema.parse(regions);
    const clash = await db.get<Design>("designs", { slug: d.slug });
    if (clash && clash.id !== id) throw new ServiceError(`Slug "${d.slug}" is already used`);
    const saved = id ? (await db.update<Design>("designs", { id }, d))[0] : await db.insert<Design>("designs", d);
    await db.remove("design_regions", { design_id: saved.id });
    for (const x of r) await db.insert<DesignRegion>("design_regions", { ...x, design_id: saved.id });
    await audit(actor, id ? "design.update" : "design.create", "design", saved.id, { slug: d.slug });
    refresh();
    return { ok: true, message: "Design saved", data: { id: saved.id } };
  } catch (e) {
    return fail(e);
  }
}

export async function designQuickAction(id: string, action: "publish" | "unpublish" | "up" | "down" | "duplicate" | "delete"): Promise<Result> {
  const actor = await requireAdmin();
  const d = await db.get<Design>("designs", { id });
  if (!d) return { ok: false, error: "Not found" };
  if (action === "publish" || action === "unpublish") await db.update("designs", { id }, { published: action === "publish" });
  if (action === "up" || action === "down") {
    const all = (await db.list<Design>("designs")).sort((a, b) => a.sort - b.sort);
    const i = all.findIndex((x) => x.id === id);
    const j = action === "up" ? i - 1 : i + 1;
    if (j >= 0 && j < all.length) {
      [all[i], all[j]] = [all[j], all[i]];
      for (let k = 0; k < all.length; k++) if (all[k].sort !== k) await db.update("designs", { id: all[k].id }, { sort: k });
    }
  }
  if (action === "duplicate") {
    const { id: _id, created_at: _c, updated_at: _u, ...rest } = d;
    void _id; void _c; void _u;
    let slug = `${d.slug}-copy`;
    for (let n = 2; await db.get("designs", { slug }); n++) slug = `${d.slug}-copy-${n}`;
    const copy = await db.insert<Design>("designs", { ...rest, slug, name: `${d.name} (copy)`, published: false, sort: d.sort + 1 });
    for (const r of await db.list<DesignRegion>("design_regions", { eq: { design_id: id } })) {
      const { id: _r, ...x } = r;
      void _r;
      await db.insert("design_regions", { ...x, design_id: copy.id });
    }
  }
  if (action === "delete") {
    const used = await db.list("configurations", { eq: { design_id: id }, limit: 1 });
    if (used.length) return { ok: false, error: "Customers have saved this design. Unpublish it instead of deleting." };
    await db.remove("design_regions", { design_id: id });
    await db.remove("designs", { id });
  }
  await audit(actor, `design.${action}`, "design", id, { slug: d.slug });
  refresh();
  return { ok: true };
}

/** Upload a design / version / option photo to the public "designs" bucket. */
export async function uploadDesignAssetAction(formData: FormData): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const file = formData.get("file");
    const kind = formData.get("kind") === "option" ? "option" : "photo";
    if (!(file instanceof File) || !file.size) throw new UploadError("Choose a file");
    const img = await processImage(file, 1800);
    const { data, ext, contentType: type } = img;
    const path = `${kind}s/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await putFile("designs", path, data, type);
    await audit(actor, "design.upload", "designs", path);
    return { ok: true, data: { url: publicUrl("designs", path) } };
  } catch (e) {
    return fail(e);
  }
}

export async function settingsSnapshot() {
  await requireAdmin();
  return loadSettings();
}
