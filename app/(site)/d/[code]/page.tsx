import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Customiser } from "@/components/customiser/Customiser";
import { getDesignBundleById, loadCatalog, publicCatalog, queueWeeks } from "@/lib/server/catalog";
import { getConfiguration } from "@/lib/server/orders";
import { getAdmin, getGuestId, getUser } from "@/lib/server/auth";
import { isValidCode, normalizeCode } from "@/lib/codes";
import { formatDate, lkrRange } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/d/[code]">): Promise<Metadata> {
  const { code } = await params;
  return { title: `Design ${normalizeCode(code)}`, robots: { index: false }, alternates: { canonical: `/d/${normalizeCode(code)}` } };
}

/** Re-opens a saved configuration exactly as it was. Public: contains no personal details. */
export default async function SavedDesignPage({ params }: PageProps<"/d/[code]">) {
  const code = normalizeCode((await params).code);
  if (!isValidCode(code, "NM")) notFound();
  const config = await getConfiguration(code);
  if (!config) notFound();
  const [bundle, catalog, weeks, guestId, user, admin] = await Promise.all([getDesignBundleById(config.design_id), loadCatalog(), queueWeeks(), getGuestId(), getUser(), getAdmin()]);
  if (!bundle) notFound();
  // Anyone with the link sees the design; free-text notes stay private to the owner and the studio
  const owner = Boolean(admin || (guestId && config.guest_id === guestId) || (user && config.user_id === user.id));
  const selections = owner ? config.selections : { ...config.selections, notes: "" };
  return (
    <div className="container-x py-6 md:py-10">
      <div className="mb-6 flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Saved design</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-green-900">{config.code}</p>
          <p className="text-sm text-muted">
            Saved {formatDate(config.created_at)} · estimate at the time {lkrRange(config.price_min, config.price_max)}
          </p>
        </div>
        <Link href={`/track?code=${config.code}`} className="btn-secondary self-start sm:self-auto">
          Track this order
        </Link>
      </div>
      <Customiser bundle={bundle} catalog={publicCatalog(catalog)} initial={selections} queueWeeks={weeks} savedCode={config.code} syncUrl={false} />
    </div>
  );
}
