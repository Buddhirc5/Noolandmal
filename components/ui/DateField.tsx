"use client";
import { CalendarDays, X } from "lucide-react";
import { cn } from "@/lib/format";

/**
 * A date field that always shows something: the chosen date, or "Choose a date".
 * iPhone Safari draws an empty <input type="date"> as a blank box, so the native
 * input sits invisibly on top (it still opens the iOS date picker when tapped).
 */
export function DateField({
  id,
  value,
  onChange,
  min,
  placeholder = "Choose a date",
  className,
  align = "right",
}: {
  id?: string;
  value: string | null | undefined;
  onChange: (v: string | null) => void;
  min?: string;
  placeholder?: string;
  className?: string;
  align?: "left" | "right";
}) {
  const label = value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : null;
  return (
    <span className={cn("relative flex min-h-11 items-center gap-2", align === "right" ? "justify-end" : "justify-between", className)}>
      <span className={cn("pointer-events-none flex items-center gap-2 text-[15px]", value ? "font-medium text-ink" : "text-pink")}>
        {!value && <CalendarDays className="size-4" aria-hidden />}
        {label ?? placeholder}
      </span>
      <input
        id={id}
        type="date"
        min={min}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        aria-label={label ? `Needed by ${label}` : placeholder}
        className="absolute inset-0 size-full cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:size-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      />
      {value && (
        <button type="button" onClick={() => onChange(null)} aria-label="Clear date" className="relative z-10 -mr-1 flex size-8 items-center justify-center rounded-full text-muted hover:bg-black/5">
          <X className="size-4" aria-hidden />
        </button>
      )}
    </span>
  );
}
