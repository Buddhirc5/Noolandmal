import type { OrderStatus } from "./types";

export const STATUS_INFO: Record<OrderStatus, { label: string; hint: string }> = {
  draft: { label: "Draft", hint: "Design saved. Send it to us on WhatsApp for a quotation." },
  quote_requested: { label: "Quote requested", hint: "We're preparing your quotation — usually within a day." },
  quoted: { label: "Quoted", hint: "Your quotation is ready. Accept it and pay the advance to confirm." },
  advance_paid: { label: "Advance paid", hint: "Thank you! Book your measurement appointment." },
  measurement_booked: { label: "Measurement booked", hint: "See you at your appointment." },
  measured: { label: "Measured", hint: "Measurements recorded. Your dress is in the queue." },
  cutting: { label: "Cutting", hint: "Your fabric is being cut." },
  sewing: { label: "Sewing", hint: "Your dress is being sewn." },
  fitting: { label: "Fitting", hint: "Time for a fitting — we'll message you to arrange it." },
  ready: { label: "Ready", hint: "Your dress is ready! Pay the balance to collect or receive delivery." },
  delivered: { label: "Delivered", hint: "Delivered. Enjoy your dress!" },
  collected: { label: "Collected", hint: "Collected. Enjoy your dress!" },
  cancelled: { label: "Cancelled", hint: "This order was cancelled." },
};

/** The customer-facing timeline (delivered/collected collapse into one final step). */
export const TIMELINE: OrderStatus[] = [
  "quote_requested",
  "quoted",
  "advance_paid",
  "measurement_booked",
  "measured",
  "cutting",
  "sewing",
  "fitting",
  "ready",
  "delivered",
];

export function timelineIndex(status: OrderStatus): number {
  if (status === "collected") return TIMELINE.length - 1;
  if (status === "draft") return -1;
  return TIMELINE.indexOf(status);
}
