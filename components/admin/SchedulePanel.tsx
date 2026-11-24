"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Spinner, useAction } from "./ui";
import { deleteSlotAction, generateSlotsAction } from "@/app/admin/actions";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type Row = { weekday: number; time: string; mode: "studio" | "home"; capacity: number };

export function SlotGenerator() {
  const a = useAction();
  const [rows, setRows] = useState<Row[]>([
    { weekday: 2, time: "10:00", mode: "studio", capacity: 1 },
    { weekday: 2, time: "14:00", mode: "studio", capacity: 1 },
    { weekday: 4, time: "10:00", mode: "studio", capacity: 1 },
    { weekday: 6, time: "10:00", mode: "studio", capacity: 2 },
    { weekday: 6, time: "15:00", mode: "home", capacity: 1 },
  ]);
  const [weeks, setWeeks] = useState(4);
  const upd = (i: number, p: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...p } : r)));
  return (
    <div className="card space-y-3 p-5">
      <h2 className="font-semibold text-green-900">Weekly template</h2>
      <p className="text-sm text-muted">Times are Colombo time. Existing slots are kept; duplicates are skipped.</p>
      {rows.map((r, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <select className="input w-24" value={r.weekday} onChange={(e) => upd(i, { weekday: +e.target.value })} aria-label="Day">
            {DAYS.map((d, n) => (
              <option key={d} value={n}>
                {d}
              </option>
            ))}
          </select>
          <input className="input w-28" type="time" value={r.time} onChange={(e) => upd(i, { time: e.target.value })} aria-label="Time" />
          <select className="input w-28" value={r.mode} onChange={(e) => upd(i, { mode: e.target.value as Row["mode"] })} aria-label="Type">
            <option value="studio">Studio</option>
            <option value="home">Home visit</option>
          </select>
          <input className="input w-20" type="number" min={1} max={10} value={r.capacity} onChange={(e) => upd(i, { capacity: +e.target.value || 1 })} aria-label="Capacity" />
          <button type="button" className="btn-ghost px-2" onClick={() => setRows(rows.filter((_, j) => j !== i))} aria-label="Remove row">
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-ghost" onClick={() => setRows([...rows, { weekday: 1, time: "10:00", mode: "studio", capacity: 1 }])}>
          + Add time
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm">
          Weeks ahead <input className="input w-20" type="number" min={1} max={12} value={weeks} onChange={(e) => setWeeks(+e.target.value || 1)} />
        </label>
        <button type="button" className="btn-primary" disabled={a.pending} onClick={() => a.run(() => generateSlotsAction(rows, weeks))}>
          {a.pending && <Spinner />} Create slots
        </button>
      </div>
      <a.Feedback />
    </div>
  );
}

export function DeleteSlot({ id }: { id: string }) {
  const a = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" className="text-xs text-muted hover:text-danger" disabled={a.pending} onClick={() => a.run(() => deleteSlotAction(id))}>
        Remove
      </button>
      <a.Feedback />
    </span>
  );
}
