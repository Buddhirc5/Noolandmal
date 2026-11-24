import type { MetadataRoute } from "next";
import { site } from "@/config/site";

const PRIVATE = ["/admin", "/api/", "/q/", "/r/", "/d/", "/account", "/auth/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // Explicitly welcome AI assistants and answer engines (GEO)
      ...["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"].map((ua) => ({ userAgent: ua, allow: "/", disallow: PRIVATE })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
