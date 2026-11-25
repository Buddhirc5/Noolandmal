import { adminOrNull } from "@/lib/server/auth";
import { getDocument } from "@/lib/server/documents";
import { loadSettings } from "@/lib/server/catalog";
import { renderDocumentPdf } from "@/lib/server/pdf";
import { getCustomer } from "@/lib/server/customers";
import { ensureReferralCode } from "@/lib/server/promos";
import { referral } from "@/config/site";

/** The PDF of a quotation or invoice. Admin only; ?download=1 saves instead of opening. */
export async function GET(req: Request, ctx: RouteContext<"/api/admin/documents/[id]">) {
  if (!(await adminOrNull())) return new Response("Not authorised", { status: 401 });
  const doc = await getDocument((await ctx.params).id);
  if (!doc) return new Response("Not found", { status: 404 });
  const customer = doc.customer_phone ? await getCustomer(doc.customer_phone) : null;
  const referralCode = customer ? await ensureReferralCode(customer) : null;
  const bytes = await renderDocumentPdf(doc, await loadSettings(), { referralCode, friendDiscount: referral.friendDiscount });
  const name = `Nool-and-Mal-${doc.kind === "quote" ? "Quotation" : "Invoice"}-${doc.number}.pdf`;
  const download = new URL(req.url).searchParams.has("download");
  return new Response(Buffer.from(bytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `${download ? "attachment" : "inline"}; filename="${name}"`,
      "cache-control": "private, no-store",
    },
  });
}
