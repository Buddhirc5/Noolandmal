"use client";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { useAction } from "./ui";
import { designQuickAction } from "@/app/admin/actions";

export function DesignQuick({ id, published }: { id: string; published: boolean }) {
  const a = useAction();
  const btn = "btn-ghost min-h-9 px-2";
  return (
    <div className="flex flex-wrap items-center gap-0.5">
      <button type="button" className={btn} disabled={a.pending} onClick={() => a.run(() => designQuickAction(id, "up"))} aria-label="Move up">
        <ArrowUp className="size-4" aria-hidden />
      </button>
      <button type="button" className={btn} disabled={a.pending} onClick={() => a.run(() => designQuickAction(id, "down"))} aria-label="Move down">
        <ArrowDown className="size-4" aria-hidden />
      </button>
      <button type="button" className={btn} disabled={a.pending} onClick={() => a.run(() => designQuickAction(id, published ? "unpublish" : "publish"))} aria-label={published ? "Unpublish" : "Publish"} title={published ? "Unpublish" : "Publish"}>
        {published ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4 text-muted" aria-hidden />}
      </button>
      <button type="button" className={btn} disabled={a.pending} onClick={() => a.run(() => designQuickAction(id, "duplicate"))} aria-label="Duplicate" title="Duplicate">
        <Copy className="size-4" aria-hidden />
      </button>
      <button type="button" className={`${btn} text-danger`} disabled={a.pending} onClick={() => confirm("Delete this design?") && a.run(() => designQuickAction(id, "delete"))} aria-label="Delete" title="Delete">
        <Trash2 className="size-4" aria-hidden />
      </button>
      <a.Feedback />
    </div>
  );
}
