import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Figtree, Instrument_Serif, Noto_Sans_Sinhala, Noto_Sans_Tamil, Noto_Serif_Sinhala } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { getLocale } from "@/lib/i18n-server";
import { getDict } from "@/lib/i18n";
import { I18nProvider } from "@/components/I18nProvider";

// Logo wordmark only
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-cormorant", display: "swap" });
// UI + headings (geometric sans, close to the ceynk.lk look)
const figtree = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-figtree", display: "swap" });
// Italic accent words and numerals
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });
const sinhala = Noto_Sans_Sinhala({ subsets: ["sinhala"], weight: ["400", "500", "600"], variable: "--font-sinhala", display: "swap", preload: false });
const serifSinhala = Noto_Serif_Sinhala({ subsets: ["sinhala"], weight: ["500", "600"], variable: "--font-serif-sinhala", display: "swap", preload: false });
const tamil = Noto_Sans_Tamil({ subsets: ["tamil"], weight: ["400", "500", "600"], variable: "--font-tamil", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Nool & Mal — Made-to-order dresses in Sri Lanka", template: "%s · Nool & Mal" },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, locale: "en_LK", url: site.url },
  twitter: { card: "summary_large_image" },
  alternates: {
    canonical: "/",
    languages: { en: "/", si: "/?lang=si", ta: "/?lang=ta", "x-default": "/" },
  },
  icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${cormorant.variable} ${figtree.variable} ${instrument.variable} ${sinhala.variable} ${serifSinhala.variable} ${tamil.variable}`}>
      <body className="min-h-dvh">
        <I18nProvider dict={getDict(locale)} locale={locale}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
