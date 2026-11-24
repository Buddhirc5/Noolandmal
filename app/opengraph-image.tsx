import { ogCard, OG_SIZE } from "@/lib/server/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Nool & Mal — made-to-order dresses in Sri Lanka";

export default function Image() {
  return ogCard({ eyebrow: "Made to order · Colombo", title: "Your dress. Your design. Sewn for you.", subtitle: "Customise online · quote on WhatsApp", image: "data:image/svg+xml;base64," + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="24" cy="14.2" rx="6.6" ry="9.4" transform="rotate(${a} 24 24)" fill="none" stroke="#1F4D40" stroke-width="1.2"/>`).join("")}<circle cx="24" cy="24" r="2.6" fill="#C9A66B"/></svg>`).toString("base64") });
}
