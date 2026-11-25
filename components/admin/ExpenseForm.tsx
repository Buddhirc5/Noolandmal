"use client";
import { useState } from "react";
import { Spinner, useAction } from "./ui";
import { addExpenseAction, deleteExpenseAction } from "@/app/admin/studio-actions";
import { EXPENSE_CATEGORIES } from "@/lib/types";

export function ExpenseForm({ today }: { today: string }) {
  const a = useAction();
  const [v, setV] = useState({ spentOn: today, category: "fabric", amount: 0, note: "" });
  return (
    <form
      className="card grid gap-3 p-5 sm:grid-cols-[150px_200px_140px_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        a.run(() => addExpenseAction(v), () => setV({ ...v, amount: 0, note: "" }));
      }}
    >
      <label className="text-sm">
        <span className="label">Date</span>
        <input className="input h-11" type="date" max={today} value={v.spentOn} onChange={(e) => setV({ ...v, spentOn: e.target.value })} />
      </label>
      <label className="text-sm">
        <span className="label">Spent on</span>
        <select className="input h-11" value={v.category} onChange={(e) => setV({ ...v, category: e.target.value })}>
          {EXPENSE_CATEGORIES.map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="label">Amount (LKR)</span>
        <input className="input h-11" type="number" min={1} value={v.amount || ""} onChange={(e) => setV({ ...v, amount: Number(e.target.value) || 0 })} />
      </label>
      <label className="text-sm">
        <span className="label">Note</span>
        <input className="input h-11" value={v.note} maxLength={200} onChange={(e) => setV({ ...v, note: e.target.value })} placeholder="e.g. 6 m chiffon from Pettah" />
      </label>
      <button className="btn-primary h-11" disabled={a.pending || !v.amount}>
        {a.pending && <Spinner />} Add
      </button>
      <div className="sm:col-span-5">
        <a.Feedback />
      </div>
    </form>
  );
}

export function DeleteExpense({ id }: { id: string }) {
  const a = useAction();
  return (
    <button type="button" className="text-xs text-muted hover:text-danger" disabled={a.pending} onClick={() => confirm("Delete this expense?") && a.run(() => deleteExpenseAction(id))}>
      Delete
    </button>
  );
}
