"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ImagePlus, Link2, Loader2, X } from "lucide-react";
import { BUDGETS, customRequestSchema, MAX_PHOTOS, MAX_PHOTO_BYTES, MAX_TOTAL_BYTES, type CustomRequestInput } from "@/lib/custom-request";
import { compressImage } from "@/lib/compress";
import { buildWhatsAppLink, type WaLang } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { useLocale } from "@/components/I18nProvider";
import { occasions } from "@/config/site";
import { toISODate, cn } from "@/lib/format";

interface Photo {
  file: File;
  url: string;
}
interface Done {
  code: string;
  link: string;
  photoCount: number;
  values: CustomRequestInput;
}

export function CustomRequestForm() {
  const locale = useLocale();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [lang, setLang] = useState<WaLang>(locale === "si" ? "si" : "en");
  const fileInput = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomRequestInput>({ resolver: zodResolver(customRequestSchema), defaultValues: { occasion: "", budget: "", neededBy: "", referenceUrl: "", notes: "", sizeNotes: "" } });

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  async function addFiles(list: FileList | null) {
    if (!list) return;
    setPhotoError(null);
    const incoming = Array.from(list);
    if (photos.length + incoming.length > MAX_PHOTOS) setPhotoError(`You can upload up to ${MAX_PHOTOS} photos.`);
    const room = incoming.slice(0, MAX_PHOTOS - photos.length);
    setCompressing(true);
    const next: Photo[] = [];
    for (const f of room) {
      if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(f.type)) {
        setPhotoError(`${f.name}: please use JPG, PNG or WebP photos.`);
        continue;
      }
      if (f.size > MAX_PHOTO_BYTES) {
        setPhotoError(`${f.name} is larger than 8 MB.`);
        continue;
      }
      const c = await compressImage(f);
      next.push({ file: c, url: URL.createObjectURL(c) });
    }
    setCompressing(false);
    setPhotos((p) => [...p, ...next]);
    if (fileInput.current) fileInput.current.value = "";
  }

  const refUrl = watch("referenceUrl");

  async function onSubmit(values: CustomRequestInput) {
    setServerError(null);
    if (!values.referenceUrl && photos.length === 0 && !values.notes) {
      setServerError("Add a link, a photo or a short description so we know what you'd like.");
      return;
    }
    const total = photos.reduce((a, p) => a + p.file.size, 0);
    if (total > MAX_TOTAL_BYTES) {
      setServerError("Those photos are too large together. Please remove one or two.");
      return;
    }
    const fd = new FormData();
    for (const [k, v] of Object.entries(values)) if (v) fd.append(k, String(v));
    for (const p of photos) fd.append("photos", p.file, p.file.name);
    try {
      const res = await fetch("/api/custom-requests", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone({ code: data.code, link: `${window.location.origin}${data.path}`, photoCount: data.photoCount, values });
    } catch {
      setServerError("You seem to be offline. Please check your connection and try again.");
    }
  }

  if (done) {
    const wa = buildWhatsAppLink(
      "custom",
      {
        code: done.code,
        occasion: done.values.occasion,
        neededBy: done.values.neededBy || null,
        budget: done.values.budget || null,
        referenceUrl: done.values.referenceUrl || null,
        photoCount: done.photoCount,
        notes: done.values.notes || "",
        link: done.link,
      },
      { lang },
    );
    return (
      <div ref={doneRef} tabIndex={-1} className="card p-6 text-center outline-none sm:p-10" role="status">
        <CheckCircle2 className="mx-auto size-10 text-success" aria-hidden />
        <p className="eyebrow mt-4">Request saved</p>
        <p className="mt-1 font-serif text-5xl font-semibold tracking-wider text-green-900">{done.code}</p>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-muted">
          {done.photoCount > 0 ? "Your photos are saved. Our team will open them from your code. " : ""}
          Tap below to send your request on WhatsApp — the message is ready, just press send.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          {(["en", "si"] as const).map((l) => (
            <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} className={`chip ${lang === l ? "chip-active" : ""}`}>
              {l === "en" ? "English" : "සිංහල"}
            </button>
          ))}
        </div>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-wa mx-auto mt-5 h-12 w-full max-w-sm text-[15px]"
          onClick={() => fetch(`/api/orders/${done.code}/whatsapp`, { method: "POST", keepalive: true }).catch(() => {})}
        >
          <WhatsAppIcon className="size-5" /> Send on WhatsApp
        </a>
        <p className="mt-6 text-xs text-muted">
          Keep your code. You can track your request at <a className="text-green-700 underline" href={`/track?code=${done.code}`}>/track</a> with your phone number.
        </p>
      </div>
    );
  }

  const err = (m?: string) => (m ? <p className="mt-1 text-sm text-danger">{m}</p> : null);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <section className="card p-5 sm:p-7">
        <h2 className="text-lg font-semibold text-green-900">1. Show us the design</h2>
        <p className="mt-1 text-sm text-muted">Paste a link, upload photos, or both.</p>
        <div className="mt-5">
          <label className="label" htmlFor="referenceUrl">
            <Link2 className="mr-1 inline size-4 text-gold-600" aria-hidden /> Link (Instagram, Pinterest, Google…)
          </label>
          <input id="referenceUrl" type="url" inputMode="url" placeholder="https://www.pinterest.com/pin/…" className="input" {...register("referenceUrl")} aria-invalid={Boolean(errors.referenceUrl)} />
          {err(errors.referenceUrl?.message)}
          {refUrl && !errors.referenceUrl && /^https?:\/\//.test(refUrl) && (
            <p className="mt-1 truncate text-xs text-muted">
              We&apos;ll open: <span className="text-ink">{new URL(refUrl).hostname}</span>
            </p>
          )}
        </div>
        <div className="mt-6">
          <span className="label">Photos (up to {MAX_PHOTOS}, JPG/PNG/WebP, max 8 MB each)</span>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {photos.map((p, i) => (
              <div key={p.url} className="relative aspect-square overflow-hidden rounded-xl border border-line">
                <img src={p.url} alt={`Reference photo ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((ps) => ps.filter((x) => x !== p))}
                  className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-ink/70 text-white"
                  aria-label={`Remove photo ${i + 1}`}
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gold bg-gold-50/50 text-xs text-green-900 hover:bg-gold-50"
              >
                {compressing ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ImagePlus className="size-5" aria-hidden />}
                {compressing ? "Preparing…" : "Add photos"}
              </button>
            )}
          </div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple className="sr-only" tabIndex={-1} onChange={(e) => addFiles(e.target.files)} aria-label="Upload reference photos" />
          {photoError && <p className="mt-2 text-sm text-danger">{photoError}</p>}
          <p className="mt-2 text-xs text-muted">Photos are resized on your phone before upload, and location data is removed.</p>
        </div>
      </section>

      <section className="card p-5 sm:p-7">
        <h2 className="text-lg font-semibold text-green-900">2. Tell us about it</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="occasion">
              Occasion
            </label>
            <select id="occasion" className="input" {...register("occasion")} aria-invalid={Boolean(errors.occasion)}>
              <option value="">Choose…</option>
              {occasions.map((o) => (
                <option key={o}>{o}</option>
              ))}
              <option>Other</option>
            </select>
            {err(errors.occasion?.message)}
          </div>
          <div>
            <label className="label" htmlFor="neededBy">
              Needed by <span className="font-normal text-muted">(optional)</span>
            </label>
            <input id="neededBy" type="date" min={toISODate(new Date())} className="input" {...register("neededBy")} />
            {err(errors.neededBy?.message)}
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="budget">
              Budget <span className="font-normal text-muted">(optional)</span>
            </label>
            <select id="budget" className="input" {...register("budget")}>
              <option value="">Not sure yet</option>
              {BUDGETS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="notes">
              What would you like?
            </label>
            <textarea id="notes" rows={4} className={cn("input min-h-28")} placeholder="e.g. Same dress but with long sleeves and in deep green, knee length…" {...register("notes")} />
            {err(errors.notes?.message)}
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="sizeNotes">
              Size notes <span className="font-normal text-muted">(optional)</span>
            </label>
            <input id="sizeNotes" className="input" placeholder="e.g. Usually M, 5'4&quot;" {...register("sizeNotes")} />
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-7">
        <h2 className="text-lg font-semibold text-green-900">3. Your details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input id="name" autoComplete="name" className="input" {...register("name")} aria-invalid={Boolean(errors.name)} />
            {err(errors.name?.message)}
          </div>
          <div>
            <label className="label" htmlFor="phone">
              WhatsApp number
            </label>
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="07X XXX XXXX" className="input" {...register("phone")} aria-invalid={Boolean(errors.phone)} />
            {err(errors.phone?.message)}
          </div>
        </div>
      </section>

      {serverError && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-[#8a2f2a]">
          {serverError}
        </p>
      )}
      <button type="submit" className="btn-primary h-12 w-full text-[15px] sm:w-auto sm:px-10" disabled={isSubmitting || compressing}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isSubmitting ? "Sending…" : "Save request & continue to WhatsApp"}
      </button>
      <p className="text-xs text-muted">By sending, you agree that we store your photos to prepare your quote. See our <a href="/privacy" className="underline">privacy notice</a>.</p>
    </form>
  );
}
