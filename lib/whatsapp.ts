// Click-to-chat deep links (https://wa.me/<number>?text=...). No paid API.
import { site } from "@/config/site";
import { formatDate, lkr, lkrRange } from "./format";

export type WaLang = "en" | "si";

export interface DesignQuotePayload {
  code: string;
  designName: string;
  colours: { region: string; colour: string }[];
  fabric: string;
  options: string[];
  size: string;
  qty: number;
  neededBy: string | null;
  min: number;
  max: number;
  link: string;
}

export interface CustomRequestPayload {
  code: string;
  occasion: string;
  neededBy: string | null;
  budget: string | null;
  referenceUrl: string | null;
  photoCount: number;
  notes: string;
  link: string;
}

export interface QuoteReplyPayload {
  name: string;
  code: string;
  total: number;
  advancePercent: number;
  advance: number;
  validUntil: string;
  link: string;
}

export interface StatusPayload {
  name: string;
  code: string;
  status: string;
  link: string;
}

type Payloads = {
  design: DesignQuotePayload;
  custom: CustomRequestPayload;
  quote: QuoteReplyPayload;
  status: StatusPayload;
  enquiry: Record<string, never>;
};

const T = {
  en: {
    hi: "Hi Nool & Mal,",
    wantQuote: (c: string) => `I'd like a quotation for design *${c}*.`,
    design: "Design",
    colours: "Colours",
    fabric: "Fabric",
    options: "Includes",
    none: "none",
    size: "Measurements",
    qty: "Qty",
    neededBy: "Needed by",
    flexible: "flexible",
    estimate: "Starting price",
    link: "Link",
    custom: (c: string) => `I have a custom design request *${c}*.`,
    occasion: "Occasion",
    budget: "Budget",
    notSet: "not set",
    reference: "Reference",
    photos: (n: number) => `${n} photo${n === 1 ? "" : "s"} uploaded`,
    notes: "Notes",
    details: "Details",
    enquiry: "Hi Nool & Mal, I have a question about a made-to-order dress.",
  },
  si: {
    hi: "ආයුබෝවන් Nool & Mal,",
    wantQuote: (c: string) => `*${c}* නිර්මාණය සඳහා මිල ගණනක් ලබා ගැනීමට කැමතියි.`,
    design: "නිර්මාණය",
    colours: "වර්ණ",
    fabric: "රෙදි වර්ගය",
    options: "ඇතුළත්",
    none: "නැත",
    size: "මිනුම්",
    qty: "ගණන",
    neededBy: "අවශ්‍ය දිනය",
    flexible: "නම්‍යශීලී",
    estimate: "ආරම්භක මිල",
    link: "සබැඳිය",
    custom: (c: string) => `මට *${c}* විශේෂ නිර්මාණ ඉල්ලීමක් තිබේ.`,
    occasion: "අවස්ථාව",
    budget: "අයවැය",
    notSet: "සඳහන් කර නැත",
    reference: "උදාහරණය",
    photos: (n: number) => `ඡායාරූප ${n}ක් උඩුගත කළා`,
    notes: "සටහන්",
    details: "විස්තර",
    enquiry: "ආයුබෝවන් Nool & Mal, ඇණවුමට මසන ඇඳුමක් ගැන ප්‍රශ්නයක් තිබේ.",
  },
};

export function buildMessage<K extends keyof Payloads>(type: K, payload: Payloads[K], lang: WaLang = "en"): string {
  const t = T[lang];
  switch (type) {
    case "design": {
      const p = payload as DesignQuotePayload;
      return [
        t.hi,
        t.wantQuote(p.code),
        `${t.design}: ${p.designName}`,
        `${t.colours}: ${p.colours.map((c) => `${c.region}: ${c.colour}`).join(", ")}`,
        `${t.fabric}: ${p.fabric}`,
        ...(p.options.length ? [`${t.options}: ${p.options.join(", ")}`] : []),
        `${t.size}: ${p.size} · ${t.qty}: ${p.qty}`,
        `${t.neededBy}: ${p.neededBy ? formatDate(p.neededBy) : t.flexible}`,
        `${t.estimate}: ${p.min === p.max ? lkr(p.min) : lkrRange(p.min, p.max)}`,
        `${t.link}: ${p.link}`,
      ].join("\n");
    }
    case "custom": {
      const p = payload as CustomRequestPayload;
      const ref = [p.referenceUrl, p.photoCount ? t.photos(p.photoCount) : null].filter(Boolean).join(" + ");
      return [
        t.hi,
        t.custom(p.code),
        `${t.occasion}: ${p.occasion || "—"} · ${t.neededBy}: ${p.neededBy ? formatDate(p.neededBy) : t.flexible}`,
        `${t.budget}: ${p.budget || t.notSet}`,
        `${t.reference}: ${ref || "—"}`,
        `${t.notes}: ${p.notes || "—"}`,
        `${t.details}: ${p.link}`,
      ].join("\n");
    }
    case "quote": {
      const p = payload as QuoteReplyPayload;
      return [
        `Hi ${p.name || "there"}, thank you! For *${p.code}* our quotation is ${lkr(p.total)}.`,
        `Advance (${p.advancePercent}%): ${lkr(p.advance)} to confirm your order.`,
        `Valid until ${formatDate(p.validUntil)}. Details & bank info: ${p.link}`,
      ].join("\n");
    }
    case "status": {
      const p = payload as StatusPayload;
      return `Hi ${p.name || "there"}, an update on *${p.code}* from Nool & Mal: ${p.status}.\nTrack it here: ${p.link}`;
    }
    default:
      return t.enquiry;
  }
}

export function waLink(text: string, number: string = site.whatsappNumber): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppLink<K extends keyof Payloads>(
  type: K,
  payload: Payloads[K],
  opts: { lang?: WaLang; to?: string } = {},
): string {
  return waLink(buildMessage(type, payload, opts.lang), opts.to);
}

/** Human-readable status messages used by the admin's one-tap notifications. */
export const STATUS_MESSAGES: Record<string, string> = {
  quoted: "your quotation is ready",
  advance_paid: "we've received your advance payment — thank you! Please book a measurement slot",
  measurement_booked: "your measurement appointment is confirmed",
  measured: "your measurements are recorded and your dress is in the queue",
  cutting: "your fabric is being cut",
  sewing: "your dress is being sewn",
  fitting: "your dress is ready for a fitting",
  ready: "your dress is ready!",
  delivered: "your dress has been delivered",
  collected: "thank you for collecting your dress",
  cancelled: "your order has been cancelled",
};
