"use client";
import { useState } from "react";
import { Download, Loader2, Share2 } from "lucide-react";
import { useAction } from "./ui";
import { deleteDocumentAction } from "@/app/admin/customer-actions";

/** Share opens the iPhone share sheet with the PDF attached (WhatsApp, Mail, Save to Files). */
export function DocumentActions({ id, number, kind, compact = false, canDelete = false }: { id: string; number: string; kind: "quote" | "invoice"; compact?: boolean; canDelete?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const a = useAction();
  const url = `/api/admin/documents/${id}`;
  const name = `Nool-and-Mal-${kind === "quote" ? "Quotation" : "Invoice"}-${number}.pdf`;

  async function share() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const file = new File([await res.blob()], name, { type: "application/pdf" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${kind === "quote" ? "Quotation" : "Invoice"} ${number}` }).catch(() => {});
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }
    } catch {
      setErr("Couldn't prepare the PDF. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const h = compact ? "h-10 px-3.5 text-[13px]" : "h-12 px-5";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={share} disabled={busy} className={`btn-primary ${h}`}>
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Share2 className="size-4" aria-hidden />} Share PDF
      </button>
      <a href={url} target="_blank" rel="noopener noreferrer" className={`btn-secondary ${h}`}>
        View
      </a>
      <a href={`${url}?download=1`} className={`btn-secondary ${h}`} aria-label={`Download ${number}`}>
        <Download className="size-4" aria-hidden />
        {!compact && " Download"}
      </a>
      {canDelete && (
        <button type="button" className="px-2 text-xs text-muted hover:text-danger" disabled={a.pending} onClick={() => confirm(`Delete ${number}?`) && a.run(() => deleteDocumentAction(id))}>
          Delete
        </button>
      )}
      {err && <p className="w-full text-sm text-danger">{err}</p>}
      <a.Feedback />
    </div>
  );
}
