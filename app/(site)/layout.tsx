import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { JsonLd, organizationLd } from "@/components/JsonLd";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { accountsEnabled, getUser } from "@/lib/server/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-paper focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Header signedIn={Boolean(user)} accountsEnabled={accountsEnabled} />
      <main id="main" className="relative z-10 bg-paper pb-24 md:rounded-b-[48px] md:shadow-[0_30px_60px_-30px_rgb(10_10_10/0.35)]">
        {children}
      </main>
      <Footer />
      <WhatsAppFab />
      <RevealObserver />
      <JsonLd data={organizationLd()} />
    </>
  );
}
