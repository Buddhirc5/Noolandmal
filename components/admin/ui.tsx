"use client";
import { useState, useTransition } from "react";
import { Check, Copy, Loader2 } from "lucide-react";

type Res = { ok: true; message?: string; data?: unknown } | { ok: false; error: string };

/** Runs a server action and shows inline feedback. */
export function useAction() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const run = (fn: () => Promise<Res>, onOk?: (r: Res & { ok: true }) => void) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        setMsg(r.message ? { ok: true, text: r.message } : null);
        onOk?.(r);
      } else setMsg({ ok: false, text: r.error });
    });
  const Feedback = () =>
    msg ? (
      <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>
        {msg.text}
      </p>
    ) : null;
  return { pending, run, Feedback, setMsg };
}

export function Spinner() {
  return <Loader2 className="size-4 animate-spin" aria-hidden />;
}

export function CopyButton({ text, label = "Copy", className = "btn-secondary" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />} {done ? "Copied" : label}
    </button>
  );
}
