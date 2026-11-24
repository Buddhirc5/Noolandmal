import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { JsonLd, organizationLd } from "@/components/JsonLd";
import { accountsEnabled, getUser } from "@/lib/server/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-paper focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Header signedIn={Boolean(user)} accountsEnabled={accountsEnabled} />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppFab />
      <JsonLd data={organizationLd()} />
    </>
  );
}
