import { z } from "zod";

/**
 * Schémas des textes du site, par section. Chaque section est stockée en JSON dans la table
 * `site_content` et validée par ces schémas à la lecture comme à l'écriture.
 * Les listes ont une longueur fixe : chaque élément est lié à une icône définie dans le code.
 */

const line = (max = 160) => z.string().trim().min(1).max(max);
const paragraph = (max = 600) => z.string().trim().min(1).max(max);

export const availabilitySchema = z.enum(["available", "in_development", "planned", "vision"]);

const item = z.object({ id: z.string(), title: line(90), text: paragraph(300) });
const statusItem = item.extend({ status: availabilitySchema });

const sectionBase = { eyebrow: line(60), title: line(140), intro: paragraph(400) };

export const siteContentSchemas = {
  "home.hero": z.object({
    eyebrow: line(80),
    title: line(120),
    subtitle: paragraph(300),
    primaryCta: line(40),
    secondaryCta: line(40),
  }),
  "home.problem": z.object({ ...sectionBase, items: z.array(item).length(6) }),
  "home.solution": z.object({ ...sectionBase, items: z.array(statusItem).length(5) }),
  "home.walkthrough": z.object({ ...sectionBase, steps: z.array(item).length(5) }),
  "home.features": z.object({ ...sectionBase, items: z.array(statusItem).length(7) }),
  "home.sectors": z.object({ ...sectionBase, items: z.array(item).length(5), note: paragraph(200) }),
  "home.onboarding": z.object({ ...sectionBase, steps: z.array(item).length(5), note: paragraph(300) }),
  "home.pricing": z.object({
    ...sectionBase,
    emptyTitle: line(80),
    emptyText: paragraph(300),
    cta: line(40),
    detailsLink: line(60),
  }),
  "home.faq": z.object(sectionBase),
  "home.finalCta": z.object({ title: line(140), text: paragraph(300), cta: line(40) }),
  "site.contact": z.object({
    intro: paragraph(300),
    email: line(120),
    phone: line(40),
    address: line(200),
    hours: line(120),
  }),
  "site.footer": z.object({ tagline: paragraph(200) }),
  "demo.page": z.object({
    title: line(120),
    intro: paragraph(400),
    nextSteps: z.array(item).length(3),
    privacyNotice: paragraph(600),
    successTitle: line(120),
    successText: paragraph(400),
  }),
} as const;

export type SiteContentKey = keyof typeof siteContentSchemas;
export type SiteContent<K extends SiteContentKey> = z.infer<(typeof siteContentSchemas)[K]>;
export type Availability = z.infer<typeof availabilitySchema>;

export const siteContentKeys = Object.keys(siteContentSchemas) as SiteContentKey[];

export function isSiteContentKey(value: string): value is SiteContentKey {
  return Object.hasOwn(siteContentSchemas, value);
}
