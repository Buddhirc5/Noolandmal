"use client";
import { useState } from "react";
import { Spinner, useAction } from "./ui";
import { saveMeasurementsAction } from "@/app/admin/studio-actions";
import { formatDate } from "@/lib/format";
import { MEASUREMENT_FIELDS, type CustomerMeasurement, type MeasurementKey } from "@/lib/types";

/** Body measurements kept per customer (by WhatsApp number), reused for every future order. */
export function MeasurementsPanel({ phone, name, saved, customerSent, today }: { phone: string; name: string; saved: CustomerMeasurement | null; customerSent?: string | null; today: string }) {
  const a = useAction();
  const [values, setValues] = useState<Partial<Record<MeasurementKey, number>>>(saved?.values ?? {});
  const [notes, setNotes] = useState(saved?.notes ?? "");
  const [takenOn, setTakenOn] = useState(saved?.taken_on ?? today);
  const [custName, setCustName] = useState(name);
  return (
    <form
      id="measurements"
      className="card scroll-mt-6 space-y-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => typeof v === "number" && v > 0));
        a.run(() => saveMeasurementsAction({ phone, name: custName, values: clean, notes, takenOn: takenOn || null }));
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold text-green-900">Measurements (cm)</h2>
        {saved && <span className="text-xs text-muted">Updated {formatDate(saved.updated_at)}</span>}
      </div>
      {!phone && <p className="text-sm text-danger">Add the customer&apos;s WhatsApp number above to save measurements.</p>}
      {saved && !Object.keys(saved.values).length && <p className="text-sm text-muted">No measurements yet.</p>}
      {customerSent && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-orchid">
          Customer sent: {customerSent}
        </p>
      )}
      {!name && (
        <label className="block text-sm">
          <span className="label">Customer name</span>
          <input className="input h-10" value={custName} onChange={(e) => setCustName(e.target.value)} />
        </label>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MEASUREMENT_FIELDS.map(([k, label]) => (
          <label key={k} className="text-sm">
            <span className="label">{label}</span>
            <input
              className="input h-10"
              type="number"
              inputMode="decimal"
              step="0.5"
              min={0}
              value={values[k] ?? ""}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                setValues((v) => ({ ...v, [k]: Number.isFinite(n) ? n : undefined }));
              }}
            />
          </label>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <label className="text-sm">
          <span className="label">Notes</span>
          <input className="input h-10" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. prefers loose fit at waist" />
        </label>
        <label className="text-sm">
          <span className="label">Taken on</span>
          <input className="input h-10" type="date" max={today} value={takenOn} onChange={(e) => setTakenOn(e.target.value)} />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={a.pending || !phone}>
          {a.pending && <Spinner />} Save measurements
        </button>
        <a.Feedback />
      </div>
      <p className="text-xs text-muted">Saved to this customer — they&apos;ll be here for every future order.</p>
    </form>
  );
}
