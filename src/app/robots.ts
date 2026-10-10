import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/espace", "/admin", "/auth/", "/reinitialiser-mot-de-passe"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
