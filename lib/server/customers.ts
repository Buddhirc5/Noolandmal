import "server-only";
// Customers are identified by their WhatsApp number (E.164 digits). Orders,
// measurements and documents all point at that number, so changing it moves
// everything together.
import { db } from "./db";
import { audit, ServiceError } from "./orders";
import { normalizePhone } from "@/lib/format";
import { parsePhone } from "@/lib/phone";
import type { Customer, CustomerMeasurement, Order, StudioDocument } from "@/lib/types";

/** For numbers already normalised to E.164 digits. */
export const isValidPhone = (e164: string) => /^\d+$/.test(e164) && parsePhone(`+${e164}`).ok;

export async function getCustomer(phone: string) {
  if (!phone) return null;
  return db.get<Customer>("customers", { phone });
}

/** Creates the customer if the number is new; fills in a missing name. */
export async function ensureCustomer(rawPhone: string, name: string): Promise<Customer | null> {
  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) return null;
  const existing = await getCustomer(phone);
  if (existing) {
    if (name && !existing.name) {
      const [u] = await db.update<Customer>("customers", { id: existing.id }, { name, updated_at: new Date().toISOString() });
      return u;
    }
    return existing;
  }
  return db.insert<Customer>("customers", { phone, name, notes: "", updated_at: new Date().toISOString() });
}

/** Everything the "new order" form needs to know about a number. */
export async function lookupCustomer(rawPhone: string) {
  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) return { phone, valid: false as const };
  const [customer, orders, measurements] = await Promise.all([
    getCustomer(phone),
    db.list<Order>("orders", { eq: { customer_phone: phone }, order: { column: "created_at", ascending: false } }),
    db.get<CustomerMeasurement>("customer_measurements", { phone }),
  ]);
  const name = customer?.name || orders.find((o) => o.customer_name)?.customer_name || measurements?.name || "";
  return {
    phone,
    valid: true as const,
    exists: Boolean(customer || orders.length || measurements),
    name,
    orders: orders.length,
    lastOrder: orders[0]?.code ?? null,
    measured: Boolean(measurements && Object.keys(measurements.values ?? {}).length),
  };
}

export async function updateCustomer(phone: string, patch: { name: string; notes: string }, actor: string) {
  const c = (await getCustomer(phone)) ?? (await ensureCustomer(phone, patch.name));
  if (!c) throw new ServiceError("Invalid phone number");
  await db.update<Customer>("customers", { id: c.id }, { ...patch, updated_at: new Date().toISOString() });
  // keep the name on their open orders in step
  if (patch.name) for (const o of await db.list<Order>("orders", { eq: { customer_phone: phone } })) if (!o.customer_name) await db.update("orders", { id: o.id }, { customer_name: patch.name });
  await audit(actor, "customer.update", "customer", phone);
}

/** Moves a customer — orders, measurements and documents — to a new number. */
export async function changeCustomerPhone(oldRaw: string, newRaw: string, actor: string) {
  const from = normalizePhone(oldRaw);
  const parsed = parsePhone(newRaw);
  if (!parsed.ok) throw new ServiceError(parsed.error);
  const to = parsed.e164;
  if (from === to) return to;
  const taken = await lookupCustomer(to);
  if (taken.valid && taken.exists) throw new ServiceError(`+${to} already belongs to ${taken.name || "another customer"}. Open that customer instead.`, 409);
  const c = await getCustomer(from);
  if (c) await db.update("customers", { id: c.id }, { phone: to, updated_at: new Date().toISOString() });
  else await ensureCustomer(to, "");
  for (const o of await db.list<Order>("orders", { eq: { customer_phone: from } })) await db.update("orders", { id: o.id }, { customer_phone: to });
  const m = await db.get<CustomerMeasurement>("customer_measurements", { phone: from });
  if (m) await db.update("customer_measurements", { id: m.id }, { phone: to });
  for (const d of await db.list<StudioDocument>("documents", { eq: { customer_phone: from } })) await db.update("documents", { id: d.id }, { customer_phone: to });
  await audit(actor, "customer.change_phone", "customer", to, { from });
  return to;
}
