"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Spinner, useAction } from "./ui";
import { saveSettingsAction } from "@/app/admin/actions";
import type { Settings } from "@/lib/types";

const NUMS: [keyof Settings, string, string][] = [
  ["range_percent", "Estimate range ±%", "Shown to customers as a range around the calculated price."],
  ["custom_color_fee", "Custom colour fee (LKR)", "Per custom (non-palette) colour."],
  ["standard_lead_days", "Standard lead time (days)", "Dates sooner than this get the rush fee."],
  ["rush_min_days", "Minimum rush lead (days)", "Sooner than this shows a warning."],
  ["rush_fee_percent", "Rush fee %", ""],
  ["advance_percent", "Default advance %", ""],
  ["quote_valid_days", "Quote validity (days)", ""],
  ["weekly_capacity", "Weekly capacity (orders)", "Max measurement bookings per week."],
  ["max_quantity", "Max quantity per design", ""],
];

export function SettingsForm({ settings }: { settings: Settings }) {
  const a = useAction();
  const [s, setS] = useState<Settings>(settings);
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        a.run(() => saveSettingsAction(s));
      }}
    >
      <section className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="font-semibold text-green-900 sm:col-span-2 lg:col-span-3">Pricing, lead time & capacity</h2>
        {NUMS.map(([k, label, hint]) => (
          <label key={k} className="text-sm">
            <span className="label">{label}</span>
            <input className="input" type="number" step="any" value={s[k] as number} onChange={(e) => setS({ ...s, [k]: Number(e.target.value) || 0 })} />
            {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
          </label>
        ))}
      </section>
      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-semibold text-green-900 sm:col-span-2">Bank transfer details (shown on quote pages)</h2>
        {(Object.keys(s.bank) as (keyof Settings["bank"])[]).map((k) => (
          <label key={k} className="text-sm">
            <span className="label">{({ accountName: "Account name", bank: "Bank", branch: "Branch", accountNumber: "Account number" } as const)[k]}</span>
            <input className="input" value={s.bank[k]} onChange={(e) => setS({ ...s, bank: { ...s.bank, [k]: e.target.value } })} />
          </label>
        ))}
      </section>
      <section className="card space-y-2 p-5">
        <h2 className="font-semibold text-green-900">Delivery fees by district</h2>
        {s.delivery_fees.map((d, i) => (
          <div key={i} className="flex gap-2">
            <input className="input" value={d.district} aria-label="District" onChange={(e) => setS({ ...s, delivery_fees: s.delivery_fees.map((x, j) => (j === i ? { ...x, district: e.target.value } : x)) })} />
            <input className="input w-36" type="number" value={d.fee} aria-label="Fee" onChange={(e) => setS({ ...s, delivery_fees: s.delivery_fees.map((x, j) => (j === i ? { ...x, fee: Number(e.target.value) || 0 } : x)) })} />
            <button type="button" className="btn-ghost px-2" aria-label="Remove district" onClick={() => setS({ ...s, delivery_fees: s.delivery_fees.filter((_, j) => j !== i) })}>
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ))}
        <button type="button" className="btn-ghost" onClick={() => setS({ ...s, delivery_fees: [...s.delivery_fees, { district: "", fee: 0 }] })}>
          + Add district
        </button>
      </section>
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={a.pending}>
          {a.pending && <Spinner />} Save settings
        </button>
        <a.Feedback />
      </div>
    </form>
  );
}
