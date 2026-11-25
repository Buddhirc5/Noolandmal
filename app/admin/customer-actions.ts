"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth";
import { ServiceError } from "@/lib/server/orders";
import { changeCustomerPhone, lookupCustomer, updateCustomer } from "@/lib/server/customers";
import { createDocument, deleteDocument } from "@/lib/server/documents";
import { optionalPhoneField } from "@/lib/phone";

type Result = { ok: true; message?: string; data?: unknown } | { ok: false; error: string };
const fail = (e: unknown): Result => ({ ok: false, error: e instanceof z.ZodError ? e.issues.map((i) => i.message).join("; ") : e instanceof ServiceError ? e.message : "Unexpected error" });
const refresh = () => revalidatePath("/admin", "layout");

export async function lookupCustomerAction(phone: string) {
  await requireAdmin();
  return lookupCustomer(String(phone).slice(0, 20));
}

export async function updateCustomerAction(phone: string, name: string, notes: string): Promise<Result> {
  const actor = await requireAdmin();
  try {
    await updateCustomer(phone, { name: name.trim().slice(0, 80), notes: notes.slice(0, 2000) }, actor);
    refresh();
    return { ok: true, message: "Saved" };
  } catch (e) {
    return fail(e);
  }
}

export async function changePhoneAction(from: string, to: string): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const phone = await changeCustomerPhone(from, to, actor);
    refresh();
    return { ok: true, message: "Number changed", data: phone };
  } catch (e) {
    return fail(e);
  }
}

const doc = z.object({
  kind: z.enum(["quote", "invoice"]),
  orderCode: z.string().max(12).nullable(),
  phone: optionalPhoneField(),
  name: z.string().trim().max(80),
  items: z
    .array(z.object({ description: z.string().trim().min(1, "Every item needs a description").max(200), qty: z.number().int().min(1).max(100), unit_price: z.number().int().min(0).max(10_000_000) }))
    .min(1, "Add at least one item")
    .max(30),
  discount: z.number().int().min(0).max(10_000_000),
  deliveryFee: z.number().int().min(0).max(100_000),
  advancePercent: z.number().min(0).max(100),
  notes: z.string().max(1000),
  dueOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

export async function createDocumentAction(input: z.input<typeof doc>): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const d = await createDocument(doc.parse(input), actor);
    refresh();
    return { ok: true, message: `${d.kind === "quote" ? "Quotation" : "Invoice"} ${d.number} created`, data: { id: d.id, number: d.number } };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteDocumentAction(id: string): Promise<Result> {
  const actor = await requireAdmin();
  try {
    await deleteDocument(id, actor);
    refresh();
    return { ok: true, message: "Deleted" };
  } catch (e) {
    return fail(e);
  }
}
