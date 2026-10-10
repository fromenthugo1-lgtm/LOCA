import { z } from "zod";

const optionalCents = z.number().int().min(0).max(100_000_000).nullable();
const optionalPositive = z.number().int().min(1).max(10_000_000).nullable();

/** Formule telle qu'éditée dans l'administration (montants en centimes d'euro). */
export const planInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{2,48}$/, "Lettres minuscules, chiffres et tirets uniquement (2 à 48 caractères)."),
  name: z.string().trim().min(2, "Nom trop court.").max(80),
  description: z.string().trim().max(600).nullable(),
  setupFeeCents: optionalCents,
  monthlyPriceCents: optionalCents,
  maxUsers: optionalPositive,
  maxRequestsPerMonth: optionalPositive,
  aiUsageLimit: optionalPositive,
  aiUsageUnit: z.string().trim().max(40).nullable(),
  features: z.array(z.string().trim().min(1).max(140)).max(20),
  displayOrder: z.number().int().min(0).max(1000),
  isPublished: z.boolean(),
});

export type PlanInput = z.infer<typeof planInputSchema>;

export type PublicPlan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  setupFeeCents: number | null;
  monthlyPriceCents: number | null;
  maxUsers: number | null;
  maxRequestsPerMonth: number | null;
  aiUsageLimit: number | null;
  aiUsageUnit: string | null;
  features: string[];
};

/** « 1 234,50 € » à partir de centimes ; null quand le montant n'est pas communiqué. */
export function formatCents(cents: number | null): string | null {
  if (cents === null) return null;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/** Convertit une saisie « 49,90 » ou « 49.9 » en centimes. Chaîne vide => null. */
export function parseEurosToCents(value: string): number | null | "invalid" {
  const trimmed = value.trim().replace(/\s/g, "").replace("€", "");
  if (trimmed === "") return null;
  if (!/^\d{1,7}([.,]\d{1,2})?$/.test(trimmed)) return "invalid";
  const [euros, decimals = ""] = trimmed.replace(",", ".").split(".");
  return Number(euros) * 100 + Number(decimals.padEnd(2, "0"));
}
