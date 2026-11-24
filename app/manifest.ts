import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nool & Mal",
    short_name: "Nool & Mal",
    description: "Made-to-order dresses in Sri Lanka",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F5F0",
    theme_color: "#1F4D40",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
