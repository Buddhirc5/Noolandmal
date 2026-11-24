"use client";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { CalendarCheck2, Check, Loader2, Upload } from "lucide-react";
import { compressImage } from "@/lib/compress";
import { cn } from "@/lib/format";

function useCall() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  async function call(url: string, init: RequestInit, success: string) {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch(url, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error ?? "Something went wrong. Please try again.");
      else {
        setDone(success);
        router.refresh();
      }
    } catch {
      setError("You seem to be offline. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const Msg = () => (
    <>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-2 text-sm text-success">
          {done}
        </p>
      )}
    </>
  );
  return { busy, call, Msg };
}

export function AcceptQuote({ code, k }: { code: string; k: string }) {
  const c = useCall();
  return (
    <div>
      <button type="button" className="btn-primary h-12 w-full sm:w-auto sm:px-8" disabled={c.busy} onClick={() => c.call(`/api/orders/${code}/accept?k=${encodeURIComponent(k)}`, { method: "POST" }, "Quote accepted — thank you!")}>
        {c.busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />} Accept quote
      </button>
      <c.Msg />
    </div>
  );
}

export function SlipUpload({ code, k, type, amountLabel }: { code: string; k: string; type: "advance" | "final"; amountLabel: string }) {
  const c = useCall();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!file) return;
        const fd = new FormData();
        fd.set("type", type);
        fd.set("slip", await compressImage(file, 2000, 0.85));
        await c.call(`/api/orders/${code}/slip?k=${encodeURIComponent(k)}`, { method: "POST", body: fd }, "Slip uploaded. We'll confirm it shortly.");
        setFile(null);
      }}
    >
      <p className="text-sm text-ink">
        Upload a photo or screenshot of your {type === "advance" ? "advance" : "balance"} payment slip ({amountLabel}).
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-secondary" onClick={() => input.current?.click()}>
          <Upload className="size-4" aria-hidden /> {file ? "Change photo" : "Choose photo"}
        </button>
        {file && <span className="max-w-48 truncate text-sm text-muted">{file.name}</span>}
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="sr-only" tabIndex={-1} aria-label="Payment slip" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button className="btn-primary" disabled={!file || c.busy}>
          {c.busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Send slip
        </button>
      </div>
      <c.Msg />
    </form>
  );
}

export interface SlotOption {
  id: string;
  starts_at: string;
  mode: "studio" | "home";
  remaining: number;
  weekFull: boolean;
  week: string;
  weekLabel: string;
  label: string;
}

export function BookingPicker({ code, k, slots, current }: { code: string; k: string; slots: SlotOption[]; current: string | null }) {
  const c = useCall();
  const [mode, setMode] = useState<"studio" | "home">("studio");
  const [slot, setSlot] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const weeks = useMemo(() => {
    const m = new Map<string, SlotOption[]>();
    for (const s of slots.filter((x) => x.mode === mode)) m.set(s.week, [...(m.get(s.week) ?? []), s]);
    return [...m.values()];
  }, [slots, mode]);
  const firstOpen = weeks.find((w) => w.some((s) => !s.weekFull && s.remaining > 0))?.[0]?.week;

  return (
    <div className="space-y-4">
      {current && (
        <p className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-900">
          <CalendarCheck2 className="size-4" aria-hidden /> Booked: {current}. You can pick another slot to reschedule.
        </p>
      )}
      <div className="flex gap-2" role="radiogroup" aria-label="Appointment type">
        {(["studio", "home"] as const).map((m) => (
          <button key={m} type="button" role="radio" aria-checked={mode === m} className={`chip ${mode === m ? "chip-active" : ""}`} onClick={() => (setMode(m), setSlot(null))}>
            {m === "studio" ? "At the studio" : "Home visit (Colombo)"}
          </button>
        ))}
      </div>
      {weeks.length === 0 && <p className="text-sm text-muted">No {mode === "home" ? "home visit" : "studio"} slots are open right now. Message us on WhatsApp and we&apos;ll find a time.</p>}
      {weeks.map((list) => {
        const full = list.every((s) => s.weekFull || s.remaining === 0);
        return (
          <fieldset key={list[0].week} disabled={full}>
            <legend className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
              Week of {list[0].weekLabel}
              {full ? <span className="badge">Fully booked</span> : list[0].week === firstOpen ? <span className="badge bg-green-50 text-green-900">Next available</span> : null}
            </legend>
            <div className="flex flex-wrap gap-2">
              {list.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={slot === s.id}
                  disabled={s.weekFull || s.remaining === 0}
                  onClick={() => setSlot(s.id)}
                  className={cn("chip min-h-10 disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through", slot === s.id && "chip-active")}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>
        );
      })}
      {mode === "home" && (
        <label className="block text-sm">
          <span className="label">Address for the home visit</span>
          <textarea className="input" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
      )}
      <button
        type="button"
        className="btn-primary"
        disabled={!slot || c.busy || (mode === "home" && !address.trim())}
        onClick={() =>
          c.call(
            `/api/orders/${code}/book?k=${encodeURIComponent(k)}`,
            { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slotId: slot, mode, address: mode === "home" ? address : null }) },
            "Appointment booked. See you soon!",
          )
        }
      >
        {c.busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Book this slot
      </button>
      <c.Msg />
    </div>
  );
}
