import { describe, expect, it } from "vitest";
import { formatCents, parseEurosToCents, planInputSchema } from "@/features/plans/schema";

const normalize = (s: string | null) => s?.replace(/\s/g, " ") ?? null;

describe("montants des formules", () => {
  it("formate des centimes en euros", () => {
    expect(normalize(formatCents(4900))).toBe("49 €");
    expect(normalize(formatCents(4990))).toBe("49,90 €");
    expect(normalize(formatCents(150000))).toBe("1 500 €");
    expect(formatCents(null)).toBeNull();
  });

  it("convertit une saisie en centimes sans erreur d'arrondi", () => {
    expect(parseEurosToCents("49,90")).toBe(4990);
    expect(parseEurosToCents("49.9")).toBe(4990);
    expect(parseEurosToCents("1 500")).toBe(150000);
    expect(parseEurosToCents("0,1")).toBe(10);
    expect(parseEurosToCents("")).toBeNull();
    expect(parseEurosToCents("abc")).toBe("invalid");
    expect(parseEurosToCents("-5")).toBe("invalid");
    expect(parseEurosToCents("1,234")).toBe("invalid");
  });

  it("refuse un identifiant de formule invalide", () => {
    const base = {
      slug: "essentiel",
      name: "Essentiel",
      description: null,
      setupFeeCents: null,
      monthlyPriceCents: null,
      maxUsers: null,
      maxRequestsPerMonth: null,
      aiUsageLimit: null,
      aiUsageUnit: null,
      features: [],
      displayOrder: 0,
      isPublished: false,
    };
    expect(planInputSchema.safeParse(base).success).toBe(true);
    expect(planInputSchema.safeParse({ ...base, slug: "Avec Espace" }).success).toBe(false);
    expect(planInputSchema.safeParse({ ...base, monthlyPriceCents: -1 }).success).toBe(false);
  });
});
