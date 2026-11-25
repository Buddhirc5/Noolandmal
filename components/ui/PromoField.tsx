"use client";
import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";

export interface AppliedPromo {
  code: string;
  kind: "discount" | "referral";
  label: string;
}

/** "Discount or referral code" box: checks the code with the server and shows what it's worth. */
export function PromoField({ phone, value, onChange, compact = false }: { phone?: string; value: AppliedPromo | null; onChange: (p: AppliedPromo | null) => void; compact?: boolean }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function apply() {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/promo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, phone: phone || undefined }) });
      const data = await res.json();
      if (data.ok) {
        onChange({ code: data.code, kind: data.kind, label: data.label });
        setCode("");
      } else setError(data.error ?? "We couldn't find that code.");
    } catch {
      setError("You seem to be offline. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (value)
    return (
      <div className="flex items-center justify-between gap-3 rounded-[16px] bg-rose-50 px-4 py-3">
        <p className="text-sm text-ink">
          <Check className="mr-1 inline size-4 text-pink" aria-hidden />
          <b className="font-semibold">{value.code}</b> — {value.label}
          <span className="block text-xs text-muted">{value.kind === "referral" ? "Referral applied — taken off your quotation." : "Taken off your quotation."}</span>
        </p>
        <button type="button" className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-white" aria-label="Remove code" onClick={() => onChange(null)}>
          <X className="size-4" aria-hidden />
        </button>
      </div>
    );

  if (!open && compact)
    return (
      <button type="button" className="text-sm font-medium text-ink underline underline-offset-4" onClick={() => setOpen(true)}>
        Have a discount or referral code?
      </button>
    );

  return (
    <div>
      <label className="label" htmlFor="promo">
        Discount or referral code
      </label>
      <div className="flex gap-2">
        <input
          id="promo"
          className="input min-w-0 flex-1 uppercase"
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={20}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          placeholder="e.g. HOMECOMING10"
        />
        <button type="button" className="btn-secondary shrink-0" disabled={busy || !code.trim()} onClick={apply}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Apply"}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-[13px] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
