import { site } from "@/config/site";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["ClothingStore", "LocalBusiness"],
    "@id": `${site.url}/#business`,
    name: site.name,
    description: site.description,
    url: site.url,
    logo: `${site.url}/icon.svg`,
    image: `${site.url}/opengraph-image`,
    telephone: `+${site.whatsappNumber}`,
    priceRange: "LKR 5,500 – 60,000",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.studio.street,
      addressLocality: site.studio.city,
      addressRegion: site.studio.region,
      addressCountry: site.studio.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.studio.lat, longitude: site.studio.lng },
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    contactPoint: { "@type": "ContactPoint", contactType: "customer service", url: `https://wa.me/${site.whatsappNumber}`, availableLanguage: ["English", "Sinhala", "Tamil"] },
    founder: { "@type": "Person", name: site.designer, jobTitle: "Fashion designer" },
    hasMap: site.studio.mapUrl,
    sameAs: [site.instagram],
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.url}` })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
