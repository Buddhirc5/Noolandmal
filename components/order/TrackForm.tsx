"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function TrackForm({ initialCode }: { initialCode: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, phone }) }).catch(() => null);
        const data = res ? await res.json().catch(() => ({})) : {};
        setBusy(false);
        if (res?.ok && data.url) router.push(data.url);
        else setError(data.error ?? "Something went wrong. Please try again.");
      }}
    >
      <div>
        <label className="label" htmlFor="t-code">
          Design or request code
        </label>
        <input id="t-code" className="input font-mono uppercase" placeholder="NM-7K4Q2" required maxLength={12} value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
      </div>
      <div>
        <label className="label" htmlFor="t-phone">
          WhatsApp number used for the order
        </label>
        <input id="t-phone" className="input" type="tel" inputMode="tel" placeholder="07X XXX XXXX" required maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-[#8a2f2a]">
          {error}
        </p>
      )}
      <button className="btn-primary h-12 w-full" disabled={busy}>
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Track order
      </button>
    </form>
  );
}
