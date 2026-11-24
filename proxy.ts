import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const GUEST_COOKIE = "nm_guest";
const LOCALE_COOKIE = "nm_lang";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // ?lang=si|ta|en sets the language cookie (used by hreflang alternates), then cleans the URL
  const lang = url.searchParams.get("lang");
  if (lang && ["en", "si", "ta"].includes(lang)) {
    const clean = url.clone();
    clean.searchParams.delete("lang");
    const res = NextResponse.redirect(clean);
    res.cookies.set(LOCALE_COOKIE, lang, { path: "/", maxAge: 31536000, sameSite: "lax" });
    return res;
  }

  // Ensure every visitor has an anonymous guest id so drafts can be saved without an account
  const hasGuest = Boolean(request.cookies.get(GUEST_COOKIE)?.value);
  const guestId = hasGuest ? null : crypto.randomUUID();
  if (guestId) request.cookies.set(GUEST_COOKIE, guestId);

  let response = NextResponse.next({ request });

  // Refresh Supabase auth session cookies when accounts are enabled
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (sbUrl && sbKey) {
    const supabase = createServerClient(sbUrl, sbKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value } of list) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
        },
      },
    });
    await supabase.auth.getUser();
  }

  if (guestId) {
    response.cookies.set(GUEST_COOKIE, guestId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.png|brand/|catalog/|.*\\.(?:png|jpg|jpeg|webp|svg|ico|txt|xml)$).*)"],
};
