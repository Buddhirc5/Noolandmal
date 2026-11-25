"use client";
import { Spinner, useAction } from "./ui";
import { markReceivedAction } from "@/app/admin/studio-actions";

export function ReceivedButton({ code }: { code: string }) {
  const a = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" className="btn-secondary h-9 px-3 text-xs" disabled={a.pending} onClick={() => a.run(() => markReceivedAction(code))}>
        {a.pending && <Spinner />} Mark received
      </button>
      <a.Feedback />
    </span>
  );
}
