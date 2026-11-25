import "server-only";
import { db } from "./db";
import { audit, currentQuote, issueQuote, ServiceError } from "./orders";
import { ensureCustomer, isValidPhone } from "./customers";
import { lkDate } from "./studio";
import { loadSettings } from "./catalog";
import { normalizePhone } from "@/lib/format";
import type { DocLine, Order, Payment, StudioDocument } from "@/lib/types";

const PREFIX = { quote: "QT", invoice: "INV" } as const;

async function nextNumber(kind: StudioDocument["kind"]) {
  const all = await db.list<StudioDocument>("documents", { eq: { kind } });
  let n = all.reduce((m, d) => Math.max(m, Number(d.number.split("-")[1]) || 0), 0) + 1;
  while (await db.get("documents", { number: `${PREFIX[kind]}-${String(n).padStart(4, "0")}` })) n++;
  return `${PREFIX[kind]}-${String(n).padStart(4, "0")}`;
}

export const docTotals = (items: DocLine[], discount: number, delivery: number) => {
  const subtotal = Math.round(items.reduce((a, l) => a + l.qty * l.unit_price, 0));
  return { subtotal, total: Math.max(0, subtotal - discount + delivery) };
};

export async function paidForOrder(orderId: string) {
  const ps = await db.list<Payment>("payments", { eq: { order_id: orderId, status: "approved" } });
  return ps.reduce((a, p) => a + p.amount, 0);
}

export interface DocumentInput {
  kind: "quote" | "invoice";
  orderCode: string | null;
  phone: string;
  name: string;
  items: DocLine[];
  discount: number;
  deliveryFee: number;
  advancePercent: number;
  notes: string;
  dueOn: string | null;
}

export async function createDocument(input: DocumentInput, actor: string): Promise<StudioDocument> {
  const order = input.orderCode ? await db.get<Order>("orders", { code: input.orderCode }) : null;
  if (input.orderCode && !order) throw new ServiceError("Order not found", 404);
  const phone = normalizePhone(input.phone || order?.customer_phone || "");
  if (!isValidPhone(phone)) throw new ServiceError("Add a valid WhatsApp number for the customer, e.g. 077 123 4567");
  const name = input.name || order?.customer_name || "";
  if (!input.items.length) throw new ServiceError("Add at least one item");
  const { subtotal, total } = docTotals(input.items, input.discount, input.deliveryFee);
  const advance = input.kind === "quote" ? Math.round((total * input.advancePercent) / 100 / 100) * 100 : 0;
  const paid = input.kind === "invoice" && order ? await paidForOrder(order.id) : 0;
  await ensureCustomer(phone, name);

  const doc = await db.insert<StudioDocument>("documents", {
    number: await nextNumber(input.kind),
    kind: input.kind,
    order_id: order?.id ?? null,
    order_code: order?.code ?? null,
    customer_phone: phone,
    customer_name: name,
    items: input.items,
    subtotal,
    discount: input.discount,
    delivery_fee: input.deliveryFee,
    total,
    advance_percent: input.kind === "quote" ? input.advancePercent : 0,
    advance_amount: advance,
    paid,
    notes: input.notes,
    issued_on: lkDate(new Date()),
    due_on: input.dueOn,
    created_by: actor,
  });

  // A quotation on an order is also the order's quote, so the order moves to "Quoted"
  if (order && input.kind === "quote") {
    const settings = await loadSettings();
    const validDays = input.dueOn ? Math.max(1, Math.round((new Date(input.dueOn).getTime() - Date.now()) / 86_400_000) + 1) : settings.quote_valid_days;
    await issueQuote(
      order,
      { amount: total - input.deliveryFee, advancePercent: input.advancePercent, deliveryFee: input.deliveryFee, validDays, note: input.notes, fulfilment: order.fulfilment, district: order.district },
      actor,
    );
  }
  await audit(actor, `document.${input.kind}`, "document", doc.number, { order: order?.code, total });
  return doc;
}

export function listDocuments(filter: { phone?: string; orderId?: string } = {}) {
  const eq: Record<string, string> | undefined = filter.phone ? { customer_phone: filter.phone } : filter.orderId ? { order_id: filter.orderId } : undefined;
  return db.list<StudioDocument>("documents", { eq, order: { column: "created_at", ascending: false } });
}

export function getDocument(id: string) {
  return db.get<StudioDocument>("documents", { id });
}

export async function deleteDocument(id: string, actor: string) {
  await db.remove("documents", { id });
  await audit(actor, "document.delete", "document", id);
}

/** Suggested first line for a new document from an order. */
export async function suggestedLines(order: Order, designName: string | null, estimate: number): Promise<DocLine[]> {
  const q = await currentQuote(order.id);
  const description = designName || order.title || "Made-to-order garment";
  return [{ description, qty: 1, unit_price: q ? q.amount : estimate }];
}
