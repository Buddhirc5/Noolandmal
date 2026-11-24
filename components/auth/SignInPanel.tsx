"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export function SignInPanel({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="btn-secondary h-12 w-full"
        onClick={async () => {
          const { error } = await supabaseBrowser().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
          if (error) {
            setState("error");
            setMsg(error.message);
          }
        }}
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.74-6-6.1s2.7-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.64-2.54C16.84 3.4 14.64 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.54 0 9.2-3.9 9.2-9.38 0-.63-.07-1.11-.15-1.6H12Z" />
        </svg>
        Continue with Google
      </button>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setState("sending");
          const { error } = await supabaseBrowser().auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
          if (error) {
            setState("error");
            setMsg(error.message);
          } else setState("sent");
        }}
      >
        <label className="label" htmlFor="email">
          Email me a sign-in link
        </label>
        <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" className="btn-primary w-full" disabled={state === "sending"}>
          {state === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null} Send link
        </button>
      </form>
      {state === "sent" && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-900">Check your inbox for the sign-in link.</p>}
      {state === "error" && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-[#8a2f2a]">{msg}</p>}
    </div>
  );
}
