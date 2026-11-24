"use client";
import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Spinner, useAction } from "./ui";
import { deleteCatalogRowAction, saveCatalogRowAction, type CatalogTable } from "@/app/admin/actions";

export type Col = {
  key: string;
  label: string;
  type: "text" | "number" | "bool" | "select" | "list" | "json" | "color";
  options?: string[];
  width?: string;
  placeholder?: string;
};
type Row = Record<string, unknown> & { id?: string };

function toInput(col: Col, v: unknown): string | boolean {
  if (col.type === "bool") return Boolean(v);
  if (col.type === "list") return Array.isArray(v) ? v.join(", ") : "";
  if (col.type === "json") return v == null ? "" : JSON.stringify(v);
  return v == null ? "" : String(v);
}
function fromInput(col: Col, v: string | boolean): unknown {
  if (col.type === "bool") return Boolean(v);
  if (col.type === "number") return Number(v) || 0;
  if (col.type === "list") {
    const items = String(v).split(",").map((s) => s.trim()).filter(Boolean);
    return items.length ? items : null;
  }
  if (col.type === "json") {
    if (!String(v).trim()) return null;
    try {
      return JSON.parse(String(v));
    } catch {
      return v;
    }
  }
  if (col.key === "image_url") return String(v).trim() || null;
  return v;
}

function RowEditor({ table, cols, row, onDeleted, onSaved }: { table: CatalogTable; cols: Col[]; row: Row; onDeleted: () => void; onSaved: (r: Row) => void }) {
  const a = useAction();
  const [vals, setVals] = useState(() => Object.fromEntries(cols.map((c) => [c.key, toInput(c, row[c.key])])));
  const [dirty, setDirty] = useState(!row.id);
  const set = (k: string, v: string | boolean) => {
    setVals({ ...vals, [k]: v });
    setDirty(true);
  };
  const save = () =>
    a.run(
      () => saveCatalogRowAction(table, row.id ?? null, Object.fromEntries(cols.map((c) => [c.key, fromInput(c, vals[c.key])]))),
      (r) => {
        setDirty(false);
        onSaved(r.data as Row);
      },
    );
  return (
    <tr className={dirty ? "bg-gold-50/40" : ""}>
      {cols.map((c) => (
        <td key={c.key} className="px-1.5 py-1.5 align-top" style={{ width: c.width }}>
          {c.type === "bool" ? (
            <input type="checkbox" className="mt-3 size-4 accent-green-900" checked={Boolean(vals[c.key])} onChange={(e) => set(c.key, e.target.checked)} aria-label={c.label} />
          ) : c.type === "select" ? (
            <select className="input min-h-9 px-2 py-1 text-sm" value={String(vals[c.key])} onChange={(e) => set(c.key, e.target.value)} aria-label={c.label}>
              {c.options!.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : c.type === "color" ? (
            <span className="flex items-center gap-1.5">
              <input type="color" className="h-9 w-9 shrink-0 cursor-pointer rounded border border-line" value={String(vals[c.key]) || "#000000"} onChange={(e) => set(c.key, e.target.value.toUpperCase())} aria-label={c.label} />
              <input className="input min-h-9 px-2 py-1 font-mono text-xs" value={String(vals[c.key])} onChange={(e) => set(c.key, e.target.value)} aria-label={`${c.label} hex`} />
            </span>
          ) : (
            <input
              className={`input min-h-9 px-2 py-1 text-sm ${c.type === "json" || c.type === "list" ? "font-mono text-xs" : ""}`}
              type={c.type === "number" ? "number" : "text"}
              value={String(vals[c.key])}
              placeholder={c.placeholder}
              onChange={(e) => set(c.key, e.target.value)}
              aria-label={c.label}
            />
          )}
        </td>
      ))}
      <td className="px-1.5 py-1.5 align-top whitespace-nowrap">
        <button type="button" className="btn-primary min-h-9 px-3" onClick={save} disabled={a.pending || !dirty} aria-label="Save row">
          {a.pending ? <Spinner /> : <Save className="size-4" aria-hidden />}
        </button>
        <button
          type="button"
          className="btn-ghost min-h-9 px-2 text-danger"
          aria-label="Delete row"
          onClick={() => {
            if (!row.id) return onDeleted();
            if (confirm("Delete this row? Existing saved designs keep their stored price."))
              a.run(() => deleteCatalogRowAction(table, row.id!), () => onDeleted());
          }}
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
        <div className="max-w-48 whitespace-normal">
          <a.Feedback />
        </div>
      </td>
    </tr>
  );
}

export function TableEditor({ table, cols, rows: rowsIn, blank, help }: { table: CatalogTable; cols: Col[]; rows: object[]; blank: Row; help?: string }) {
  const initial = rowsIn as Row[];
  const [rows, setRows] = useState<(Row & { _k: string })[]>(() => initial.map((r) => ({ ...r, _k: r.id ?? crypto.randomUUID() })));
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        {help && <p className="max-w-2xl text-sm text-muted">{help}</p>}
        <button type="button" className="btn-secondary shrink-0" onClick={() => setRows([{ ...blank, _k: crypto.randomUUID() }, ...rows])}>
          <Plus className="size-4" aria-hidden /> Add
        </button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              {cols.map((c) => (
                <th key={c.key} className="px-2 py-2.5 font-medium">
                  {c.label}
                </th>
              ))}
              <th className="w-28" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <RowEditor
                key={r._k}
                table={table}
                cols={cols}
                row={r}
                onDeleted={() => setRows((rs) => rs.filter((x) => x._k !== r._k))}
                onSaved={(saved) => setRows((rs) => rs.map((x) => (x._k === r._k ? { ...saved, _k: r._k } : x)))}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
