"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth";
import { getOrder, ServiceError } from "@/lib/server/orders";
import { addExpense, createManualOrder, deleteExpense, markReceived, recordPayment, removePayment, saveMeasurements } from "@/lib/server/studio";
import { EXPENSE_CATEGORIES, MEASUREMENT_FIELDS } from "@/lib/types";
import { phoneField } from "@/lib/phone";

type Result = { ok: true; message?: string; data?: unknown } | { ok: false; error: string };
const fail = (e: unknown): Result => ({
  ok: false,
  error: e instanceof z.ZodError ? e.issues.map((i) => i.message).join("; ") : e instanceof ServiceError ? e.message : "Unexpected error",
});
const refresh = () => revalidatePath("/admin", "layout");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");

async function orderOr404(code: string) {
  const order = await getOrder(code);
  if (!order) throw new ServiceError("Order not found", 404);
  return order;
}

export async function markReceivedAction(code: string): Promise<Result> {
  const actor = await requireAdmin();
  try {
    await markReceived(await orderOr404(code), actor);
    refresh();
    return { ok: true, message: "Marked as received" };
  } catch (e) {
    return fail(e);
  }
}

const manual = z.object({
  name: z.string().trim().min(1, "Add the customer's name").max(80),
  phone: phoneField("Add the customer's WhatsApp number — it's their ID"),
  title: z.string().trim().min(2, "Describe what you're making").max(120),
  details: z.string().trim().max(2000),
  neededBy: isoDate.nullable(),
  designId: z.string().max(80).nullable(),
});

export async function createManualOrderAction(input: z.input<typeof manual>): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const order = await createManualOrder(manual.parse(input), actor);
    refresh();
    return { ok: true, message: "Order created", data: order.code };
  } catch (e) {
    return fail(e);
  }
}

const payment = z.object({ code: z.string(), type: z.enum(["advance", "final"]), amount: z.number().int().min(1, "Enter the amount").max(10_000_000), paidOn: isoDate });

export async function recordPaymentAction(input: z.input<typeof payment>): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const v = payment.parse(input);
    await recordPayment(await orderOr404(v.code), v, actor);
    refresh();
    return { ok: true, message: v.type === "advance" ? "Advance recorded" : "Full payment recorded" };
  } catch (e) {
    return fail(e);
  }
}

export async function removePaymentAction(id: string): Promise<Result> {
  const actor = await requireAdmin();
  try {
    await removePayment(id, actor);
    refresh();
    return { ok: true, message: "Payment removed" };
  } catch (e) {
    return fail(e);
  }
}

const measureKeys = MEASUREMENT_FIELDS.map(([k]) => k) as [string, ...string[]];
const measurements = z.object({
  phone: phoneField("Add the customer's WhatsApp number first"),
  name: z.string().trim().max(80),
  values: z.partialRecord(z.enum(measureKeys), z.number().min(0).max(300)),
  notes: z.string().max(2000),
  takenOn: isoDate.nullable(),
});

export async function saveMeasurementsAction(input: z.input<typeof measurements>): Promise<Result> {
  const actor = await requireAdmin();
  try {
    await saveMeasurements(measurements.parse(input), actor);
    refresh();
    return { ok: true, message: "Measurements saved" };
  } catch (e) {
    return fail(e);
  }
}

const expense = z.object({
  spentOn: isoDate,
  category: z.enum(EXPENSE_CATEGORIES.map(([k]) => k) as [string, ...string[]]),
  amount: z.number().int().min(1, "Enter the amount").max(10_000_000),
  note: z.string().trim().max(200),
});

export async function addExpenseAction(input: z.input<typeof expense>): Promise<Result> {
  const actor = await requireAdmin();
  try {
    const v = expense.parse(input);
    await addExpense({ ...v, category: v.category as never }, actor);
    refresh();
    return { ok: true, message: "Expense added" };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteExpenseAction(id: string): Promise<Result> {
  const actor = await requireAdmin();
  try {
    await deleteExpense(id, actor);
    refresh();
    return { ok: true, message: "Expense deleted" };
  } catch (e) {
    return fail(e);
  }
}
