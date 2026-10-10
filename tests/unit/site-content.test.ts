import { describe, expect, it } from "vitest";
import { siteContentDefaults } from "@/features/site-content/defaults";
import { isSiteContentKey, siteContentKeys, siteContentSchemas } from "@/features/site-content/schemas";

describe("textes par défaut du site", () => {
  it.each(siteContentKeys)("la section %s respecte son schéma", (key) => {
    expect(siteContentSchemas[key].safeParse(siteContentDefaults[key]).success).toBe(true);
  });

  it("reconnaît les clés de section valides", () => {
    expect(isSiteContentKey("home.hero")).toBe(true);
    expect(isSiteContentKey("toString")).toBe(false);
    expect(isSiteContentKey("inconnue")).toBe(false);
  });

  it("garde les textes fournis par Hugo", () => {
    expect(siteContentDefaults["home.hero"].title).toBe("Vos demandes de prix fournisseurs, automatisées par l'IA.");
    expect(siteContentDefaults["home.finalCta"].title).toBe(
      "Et si vous passiez moins de temps à consulter vos fournisseurs ?",
    );
  });

  it("n'utilise ni tiret long ni demi-cadratin comme ponctuation", () => {
    const all = JSON.stringify(siteContentDefaults);
    expect(all).not.toMatch(/[—–]/);
  });
});
