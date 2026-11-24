"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { Breakdown } from "./Breakdown";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { colorHex, colorName } from "@/lib/colors";
import { buildWhatsAppLink, type WaLang } from "@/lib/whatsapp";
import { lkrRange, formatDate } from "@/lib/format";
import { useLocale } from "@/components/I18nProvider";
import type { Catalog, DesignBundle, PriceResult, Selections } from "@/lib/types";

interface Saved {
  code: string;
  min: number;
  max: number;
  total: number;
}

export function QuoteDialog({
  open,
  onClose,
  bundle,
  catalog,
  selections,
  price,
  photo,
}: {
  open: boolean;
  onClose: () => void;
  bundle: DesignBundle;
  catalog: Catalog;
  selections: Selections;
  price: PriceResult;
  photo: string | null;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const locale = useLocale();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lang, setLang] = useState<WaLang>(locale === "si" ? "si" : "en");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [savedFor, setSavedFor] = useState<string>("");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const fingerprint = JSON.stringify(selections) + price.total;
  // a new configuration needs a new code
  useEffect(() => {
    if (saved && savedFor !== fingerprint) setSaved(null);
  }, [fingerprint, saved, savedFor]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const { design, regions } = bundle;
  const versionName = selections.version ? design.versions.find((v) => v.key === selections.version)?.name : undefined;
  const fullName = versionName ? `${design.name} — ${versionName}` : design.name;
  // "As designed" placeholders (neck-design, len-design…) add nothing to the summary
  const optionNames = selections.options.filter((k) => !k.endsWith("-design")).map((k) => catalog.options.find((o) => o.key === k)?.name ?? k);
  const fabricName = catalog.fabrics.find((f) => f.key === selections.fabric)?.name ?? selections.fabric;
  const sizeLabel = catalog.sizes.find((s) => s.key === selections.size)?.label ?? selections.size;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setErrors([]);
    try {
      const res = await fetch("/api/configurations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: design.slug, selections, clientTotal: price.total, name: name.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setErrors(res.status === 409 ? ["Prices were just updated. Please reload the page to see the latest estimate."] : (data.details ?? []));
        return;
      }
      setSaved(data);
      setSavedFor(fingerprint);
    } catch {
      setError("You seem to be offline. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = saved ? `${origin}/d/${saved.code}` : "";
  const waHref = saved
    ? buildWhatsAppLink(
        "design",
        {
          code: saved.code,
          designName: fullName,
          colours: regions.map((r) => ({ region: r.label, colour: colorName(selections.colors[r.key], catalog.palette) })),
          fabric: fabricName,
          options: optionNames,
          size: sizeLabel,
          qty: selections.qty,
          neededBy: selections.neededBy,
          min: saved.min,
          max: saved.max,
          link,
        },
        { lang },
      )
    : "";

  const copy = async (what: "code" | "link") => {
    if (!saved) return;
    try {
      await navigator.clipboard.writeText(what === "code" ? saved.code : link);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {}
  };

  const share = async () => {
    if (!saved) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${design.name} — ${saved.code}`, text: `My Nool & Mal design ${saved.code}`, url: link });
        return;
      } catch {}
    }
    copy("link");
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[92dvh] w-[min(560px,calc(100vw-24px))] overflow-y-auto rounded-[32px] bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
      aria-labelledby="quote-title"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/95 px-5 py-4 backdrop-blur">
        <h2 id="quote-title" className="text-2xl font-semibold tracking-tight text-green-900">
          {saved ? "Your design code" : "Get your quotation"}
        </h2>
        <button type="button" className="btn-ghost size-10 px-0" onClick={onClose} aria-label="Close">
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="p-5">
        {/* Summary card */}
        <div className="flex gap-4 rounded-[22px] bg-surface p-3">
          <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-[16px] bg-paper">{photo && <Image src={photo} alt="" fill sizes="96px" className="object-cover" />}</div>
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-ink">{fullName}</p>
            <ul className="mt-1 space-y-0.5 text-xs leading-5 text-muted">
              {regions.map((r) => (
                <li key={r.key} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full ring-1 ring-black/10" style={{ background: colorHex(selections.colors[r.key], catalog.palette) }} />
                  {r.label}: {colorName(selections.colors[r.key], catalog.palette)}
                </li>
              ))}
              <li>Fabric: {fabricName}</li>
              {optionNames.length > 0 && <li className="line-clamp-2">Includes: {optionNames.join(", ")}</li>}
              <li>
                Size {sizeLabel} · Qty {selections.qty}
                {selections.neededBy ? ` · by ${formatDate(selections.neededBy)}` : ""}
              </li>
            </ul>
            <p className="mt-2 text-lg font-semibold tracking-tight text-green-900">{lkrRange(saved?.min ?? price.min, saved?.max ?? price.max)}</p>
          </div>
        </div>

        {!saved ? (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <p className="text-sm leading-6 text-muted">
              We&apos;ll save your design and give you a code. Then tap WhatsApp to send it — we reply with your final quotation, usually within a day.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="q-name">
                  Your name <span className="font-normal text-muted">(optional)</span>
                </label>
                <input id="q-name" className="input" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="q-phone">
                  WhatsApp number <span className="font-normal text-muted">(optional)</span>
                </label>
                <input id="q-phone" className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="07X XXX XXXX" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <p className="-mt-1 text-xs text-muted">Add your number to track the order later with your code.</p>
            <fieldset>
              <legend className="label">WhatsApp message language</legend>
              <div className="flex gap-2">
                {(["en", "si"] as const).map((l) => (
                  <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} className={`chip ${lang === l ? "chip-active" : ""}`}>
                    {l === "en" ? "English" : "සිංහල"}
                  </button>
                ))}
              </div>
            </fieldset>
            {error && (
              <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-[#8a2f2a]">
                <p className="font-medium">{error}</p>
                {errors.length > 0 && (
                  <ul className="mt-1 list-disc pl-5">
                    {errors.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <button type="submit" className="btn-primary h-12 w-full text-[15px]" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {busy ? "Saving your design…" : "Save design & get my code"}
            </button>
            <details className="text-sm">
              <summary className="cursor-pointer text-green-700">Price breakdown</summary>
              <div className="mt-3">
                <Breakdown price={price} />
              </div>
            </details>
          </form>
        ) : (
          <div className="mt-5 text-center">
            <p className="eyebrow">Design code</p>
            <p className="mt-1 text-5xl font-semibold tracking-wider text-green-900" aria-live="polite">
              {saved.code}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Send it to us on WhatsApp — the message is ready, just tap send.</p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa mt-5 h-12 w-full text-[15px]"
              onClick={() => fetch(`/api/orders/${saved.code}/whatsapp`, { method: "POST", keepalive: true }).catch(() => {})}
            >
              <WhatsAppIcon className="size-5" /> Chat on WhatsApp
            </a>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" className="btn-secondary" onClick={() => copy("code")}>
                {copied === "code" ? "Copied" : "Copy code"}
              </button>
              <button type="button" className="btn-secondary" onClick={share}>
                {copied === "link" ? "Link copied" : "Share link"}
              </button>
            </div>
            <p className="mt-5 text-xs leading-5 text-muted">
              Saved to <Link href="/account" className="text-green-700 underline underline-offset-2">My designs</Link> on this device. Log in to keep it across devices. You can re-open it any time at{" "}
              <span className="whitespace-nowrap text-ink">/d/{saved.code}</span>.
            </p>
          </div>
        )}
      </div>
    </dialog>
  );
}
