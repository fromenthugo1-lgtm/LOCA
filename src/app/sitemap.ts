import type { MetadataRoute } from "next";
import { routes } from "@/config/routes";
import { getSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const pages: { path: string; priority: number }[] = [
    { path: routes.home, priority: 1 },
    { path: routes.demo, priority: 0.9 },
    { path: routes.pricing, priority: 0.8 },
    { path: routes.contact, priority: 0.5 },
    { path: routes.legalNotice, priority: 0.2 },
    { path: routes.privacy, priority: 0.2 },
    { path: routes.terms, priority: 0.2 },
    { path: routes.salesTerms, priority: 0.2 },
  ];
  return pages.map(({ path, priority }) => ({ url: `${base}${path === "/" ? "" : path}`, priority }));
}
