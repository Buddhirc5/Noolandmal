// Mini UI mockups used in feature cards and steps (ceynk-style "product-led" cards).
import { Check } from "lucide-react";

const SWATCHES = ["#1F4D40", "#A9BFA8", "#9ED9D2", "#1F2A4A", "#EFC8C4", "#D9A5A0", "#9C7A97", "#4A1F3D", "#6E1423", "#C9A66B", "#F4EEE2", "#151515"];

export function SwatchMock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="w-full max-w-[260px] rounded-2xl border border-line bg-paper p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-ink">Main fabric</span>
        <span className="text-muted">Dusty Rose</span>
      </div>
      <div className={`mt-3 grid grid-cols-6 gap-2 ${compact ? "" : ""}`}>
        {SWATCHES.map((c, i) => (
          <span key={c} className={`relative aspect-square rounded-full ring-1 ring-black/10 ${i === 5 ? "ring-2 ring-green-900 ring-offset-2" : ""}`} style={{ background: c }}>
            {i === 5 && <Check className="absolute inset-0 m-auto size-3.5 text-white" aria-hidden />}
          </span>
        ))}
      </div>
      {!compact && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs text-muted">
          <span className="size-4 rounded-full bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]" /> Custom colour
        </div>
      )}
    </div>
  );
}

export function PriceMock() {
  const lines: [string, string][] = [
    ["Base design", "18,500"],
    ["Satin", "+2,500"],
    ["Puff sleeves", "+1,800"],
    ["Lace hem trim", "+2,500"],
  ];
  return (
    <div className="w-full max-w-[260px] rounded-2xl border border-line bg-paper p-4 text-xs shadow-sm">
      {lines.map(([l, v]) => (
        <div key={l} className="flex justify-between py-1 text-muted">
          <span>{l}</span>
          <span className="tabular-nums text-ink">{v}</span>
        </div>
      ))}
      <div className="my-2 hairline" />
      <div className="flex items-end justify-between">
        <span className="text-muted">Estimated</span>
        <span className="text-lg font-semibold tracking-tight text-green-900">LKR 23,300 – 27,300</span>
      </div>
    </div>
  );
}

export function ChatMock() {
  return (
    <div className="w-full max-w-[260px] rounded-2xl bg-[#ECE5DD] p-3 text-[11px] leading-4 shadow-sm">
      <div className="ml-auto w-[85%] rounded-xl rounded-tr-sm bg-[#D9FDD3] p-2.5 text-ink">
        Hi Nool &amp; Mal 👋 I&apos;d like a quotation for design <b>NM-7K4Q2</b>.
        <span className="mt-1 block text-[10px] text-muted">Estimate: LKR 23,300 – 27,300</span>
      </div>
      <div className="mt-2 w-[85%] rounded-xl rounded-tl-sm bg-white p-2.5 text-ink">
        Thank you! For <b>NM-7K4Q2</b> our quotation is LKR 25,500. Advance (50%): LKR 12,800 ✨
      </div>
    </div>
  );
}

export function BookingMock() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="w-full max-w-[260px] rounded-2xl border border-line bg-paper p-4 text-xs shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-ink">Measurement slot</span>
        <span className="badge">Studio</span>
      </div>
      <div className="mt-3 grid grid-cols-6 gap-1.5 text-center">
        {days.map((d, i) => (
          <div key={d} className={`rounded-lg border py-1.5 ${i === 3 ? "border-green-900 bg-green-900 text-white" : i === 1 ? "border-line bg-ivory text-muted line-through" : "border-line text-ink"}`}>
            <span className="block text-[10px]">{d}</span>
            <span className="font-medium">{12 + i}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-1.5">
        {["10:00", "11:30", "2:00"].map((t, i) => (
          <span key={t} className={`rounded-full border px-2.5 py-1 ${i === 1 ? "border-green-900 text-green-900" : "border-line text-muted"}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CodeMock() {
  return (
    <div className="w-full max-w-[240px] rounded-2xl border border-line bg-paper p-4 text-center shadow-sm">
      <p className="text-[10px] tracking-[0.2em] text-muted uppercase">Your design code</p>
      <p className="mt-1 text-3xl font-semibold tracking-wide text-green-900">NM-7K4Q2</p>
      <span className="btn-wa mt-3 min-h-8 w-full px-3 text-xs">Chat on WhatsApp</span>
    </div>
  );
}

export function NeedleMock() {
  const steps = ["Cutting", "Sewing", "Fitting", "Ready"];
  return (
    <div className="w-full max-w-[240px] rounded-2xl border border-line bg-paper p-4 text-xs shadow-sm">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 py-1">
          <span className={`flex size-4 items-center justify-center rounded-full ${i < 2 ? "bg-green-900 text-white" : i === 2 ? "border-2 border-gold" : "border border-line"}`}>
            {i < 2 && <Check className="size-2.5" aria-hidden />}
          </span>
          <span className={i < 3 ? "text-ink" : "text-muted"}>{s}</span>
        </div>
      ))}
    </div>
  );
}
