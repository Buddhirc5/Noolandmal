import { lkr } from "@/lib/format";
import type { PriceResult } from "@/lib/types";

export function Breakdown({ price }: { price: PriceResult }) {
  return (
    <dl className="space-y-1.5 text-sm">
      {price.lines
        .filter((l) => l.kind !== "rush")
        .map((l, i) => (
          <div key={i} className="flex justify-between gap-4">
            <dt className="text-muted">{l.label}</dt>
            <dd className="tabular-nums text-ink">{i === 0 ? lkr(l.amount) : `${l.amount >= 0 ? "+" : "−"}${Math.abs(l.amount).toLocaleString("en-LK")}`}</dd>
          </div>
        ))}
      {price.quantity > 1 && (
        <div className="flex justify-between gap-4 border-t border-line pt-1.5">
          <dt className="text-muted">
            {lkr(price.unit)} × {price.quantity}
          </dt>
          <dd className="tabular-nums">{lkr(price.subtotal)}</dd>
        </div>
      )}
      {price.rushFee > 0 && (
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{price.lines.find((l) => l.kind === "rush")?.label}</dt>
          <dd className="tabular-nums">+{price.rushFee.toLocaleString("en-LK")}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4 border-t border-line pt-1.5 font-medium">
        <dt>Calculated</dt>
        <dd className="tabular-nums">{lkr(price.total)}</dd>
      </div>
    </dl>
  );
}

