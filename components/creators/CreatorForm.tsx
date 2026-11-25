"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { creatorSchema, FOLLOWER_RANGES, PLATFORMS, type CreatorInput } from "@/lib/creator";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { creatorProgram } from "@/config/site";
import { PhoneHint } from "@/components/ui/PhoneHint";

export function CreatorForm({ designs }: { designs: string[] }) {
  const [done, setDone] = useState<{ code: string; values: CreatorInput } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatorInput>({ resolver: zodResolver(creatorSchema), defaultValues: { email: "", design: "", videoUrl: "", notes: "" } });

  async function onSubmit(values: CreatorInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/creators", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setServerError(data.error ?? "Something went wrong. Please try again.");
      setDone({ code: data.code, values });
    } catch {
      setServerError("You seem to be offline. Please try again.");
    }
  }

  if (done) {
    const msg = [
      `Hi Nool & Mal, I've applied to the creator programme (*${done.code}*).`,
      `${done.values.platform}: ${done.values.handle} · ${done.values.followers} followers`,
      done.values.design ? `I'd love to wear: ${done.values.design}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    return (
      <div className="text-center" role="status">
        <p className="eyebrow">Application sent</p>
        <p className="mt-3 text-5xl font-semibold tracking-wider text-ink">{done.code}</p>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-7 text-muted">
          Thank you, {done.values.name.split(" ")[0]}. We look at every profile ourselves and reply on WhatsApp, usually within a few days.
        </p>
        <a href={waLink(msg)} target="_blank" rel="noopener noreferrer" className="btn-wa mt-6 h-12 px-6">
          <WhatsAppIcon className="size-5" /> Say hello on WhatsApp
        </a>
      </div>
    );
  }

  const err = (m?: string) => (m ? <p className="mt-1.5 text-[13px] text-danger">{m}</p> : null);
  const opt = <span className="font-normal text-muted">(optional)</span>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">Name</label>
          <input id="c-name" className="input" autoComplete="name" placeholder="Your name" {...register("name")} aria-invalid={Boolean(errors.name)} />
          {err(errors.name?.message)}
        </div>
        <div>
          <label className="label" htmlFor="c-phone">WhatsApp number</label>
          <input id="c-phone" className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="077 123 4567" {...register("phone")} aria-invalid={Boolean(errors.phone)} />
          {errors.phone ? err(errors.phone.message) : <PhoneHint value={watch("phone") ?? ""} />}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="c-email">Email {opt}</label>
        <input id="c-email" className="input" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} aria-invalid={Boolean(errors.email)} />
        {err(errors.email?.message)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-platform">Main platform</label>
          <select id="c-platform" className="input" defaultValue="" {...register("platform")} aria-invalid={Boolean(errors.platform)}>
            <option value="" disabled>Choose…</option>
            {PLATFORMS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          {err(errors.platform?.message)}
        </div>
        <div>
          <label className="label" htmlFor="c-followers">Followers</label>
          <select id="c-followers" className="input" defaultValue="" {...register("followers")} aria-invalid={Boolean(errors.followers)}>
            <option value="" disabled>Choose…</option>
            {FOLLOWER_RANGES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          {err(errors.followers?.message)}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="c-handle">Handle or profile link</label>
        <input id="c-handle" className="input" placeholder="@yourname or profile link" {...register("handle")} aria-invalid={Boolean(errors.handle)} />
        {err(errors.handle?.message)}
      </div>
      <div>
        <label className="label" htmlFor="c-design">A design you&apos;d love to wear {opt}</label>
        <select id="c-design" className="input" {...register("design")}>
          <option value="">Not sure yet</option>
          {designs.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="c-video">Link to a video you&apos;ve made {opt}</label>
        <input id="c-video" className="input" type="url" inputMode="url" placeholder="https://…" {...register("videoUrl")} aria-invalid={Boolean(errors.videoUrl)} />
        {err(errors.videoUrl?.message)}
        <p className="mt-1.5 text-[13px] text-muted">Anything that shows your style — it helps us picture your video.</p>
      </div>
      <div>
        <label className="label" htmlFor="c-notes">Your idea {opt}</label>
        <textarea id="c-notes" rows={3} className="input" placeholder="e.g. a homecoming get-ready-with-me, or the reveal after my fitting" {...register("notes")} />
      </div>
      {serverError && (
        <p role="alert" className="rounded-[16px] bg-rose-50 px-4 py-3 text-sm text-danger">
          {serverError}
        </p>
      )}
      <button className="btn-primary h-14 w-full text-[16px]" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />} Apply to the programme
      </button>
      <p className="text-center text-[13px] text-muted">
        Takes a minute. No payment needed. Remember to add {creatorProgram.hashtag} to your video.
      </p>
    </form>
  );
}
