import { site } from "@/config/site";
import { listDesignCards, loadSettings } from "@/lib/server/catalog";
import { faqs } from "@/data/faq";
import { guides } from "@/data/guides";

/** Plain-text summary for AI assistants (https://llmstxt.org). */
export async function GET() {
  const [cards, s] = await Promise.all([listDesignCards(), loadSettings()]);
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## Services",
    "- Made-to-order dresses, frocks, occasion gowns, bridal and lehenga sets, pre-draped sarees, saree blouses, hand-crocheted tops and kids' frocks.",
    "- Online customiser: change colours per part of the garment, fabric, neckline, sleeves, length and details, showing the starting price. Colours cost nothing extra; fabric, details and rush dates are agreed in a final WhatsApp quotation.",
    "- Custom requests from a photo or an Instagram/Pinterest link.",
    `- Based in ${site.studio.city}, Sri Lanka. Island-wide delivery or studio pickup.`,
    "",
    "## Process",
    "1. Customise a design online (no account needed) and get a design code (e.g. NM-7K4Q2).",
    "2. Send the code on WhatsApp; the team replies with a final quotation, usually within a day.",
    `3. Pay a ${s.advance_percent}% advance by bank transfer and upload the slip; book a measurement appointment.`,
    `4. Cutting, sewing and one fitting; most pieces take 1–3 weeks, detailed patterns 3–6 weeks. Rush orders may cost extra. Customers measured once have their measurements kept on file.`,
    "5. Pay the balance; collect or receive delivery.",
    "",
    "## Designs and starting prices (LKR)",
    ...cards.map((c) => `- [${c.design.name}](${site.url}/collection/${c.design.slug}): from ${c.design.base_price.toLocaleString("en-LK")}. ${c.design.description}`),
    "",
    "## FAQ",
    ...faqs.map((f) => `- **${f.q}** ${f.a}`),
    "",
    "## Guides",
    ...guides.map((g) => `- [${g.title}](${site.url}/guides/${g.slug})`),
    "",
    "## Contact",
    `- WhatsApp: https://wa.me/${site.whatsappNumber}`,
    `- Website: ${site.url}`,
    `- Instagram: ${site.instagram}`,
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
