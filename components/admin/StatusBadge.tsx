import { STATUS_INFO } from "@/lib/status";
import type { OrderStatus } from "@/lib/types";

const TONE: Partial<Record<OrderStatus, string>> = {
  draft: "bg-line/70 text-muted",
  quote_requested: "bg-rose-50 text-[#8a4a44]",
  quoted: "bg-gold-50 text-[#7a5a22]",
  advance_paid: "bg-green-50 text-green-900",
  ready: "bg-green-900 text-white",
  delivered: "bg-green-900/80 text-white",
  collected: "bg-green-900/80 text-white",
  cancelled: "bg-line text-muted line-through",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONE[status] ?? "bg-paper text-ink ring-1 ring-line"}`}>{STATUS_INFO[status].label}</span>;
}
