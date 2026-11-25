"use client";
import { parsePhone, PHONE_HINT } from "@/lib/phone";
import { cn } from "@/lib/format";

/** Live feedback under a phone input: the formatted number when valid, the problem when not. */
export function PhoneHint({ value, dark = false, showHint = true }: { value: string; dark?: boolean; showHint?: boolean }) {
  const digits = value.replace(/\D/g, "");
  if (!value.trim()) return showHint ? <p className={cn("mt-1.5 text-[13px]", dark ? "text-white/60" : "text-muted")}>{PHONE_HINT}</p> : null;
  const r = parsePhone(value);
  if (r.ok) return <p className={cn("mt-1.5 text-[13px] font-medium", dark ? "text-white" : "text-ink")} aria-live="polite">✓ {r.display}</p>;
  // don't nag while they're still typing a normal-looking number
  if (digits.length < 9 && !/[^\d\s+().-]/.test(value)) return <p className={cn("mt-1.5 text-[13px]", dark ? "text-white/60" : "text-muted")}>{PHONE_HINT}</p>;
  return (
    <p className="mt-1.5 text-[13px] text-danger" role="alert">
      {r.error}
    </p>
  );
}
