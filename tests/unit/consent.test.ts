import { describe, expect, it } from "vitest";
import { isAllowed, parseConsent, serializeConsent } from "@/features/consent/consent";
import { optionalCategoriesWithTools } from "@/config/cookies";

describe("consentement aux cookies", () => {
  it("refuse toute finalité optionnelle sans choix explicite", () => {
    expect(isAllowed(null, "analytics")).toBe(false);
    expect(isAllowed(null, "necessary")).toBe(true);
  });

  it("relit un choix enregistré", () => {
    const state = parseConsent(serializeConsent({ analytics: true }));
    expect(isAllowed(state, "analytics")).toBe(true);
    const refused = parseConsent(serializeConsent({ analytics: false }));
    expect(isAllowed(refused, "analytics")).toBe(false);
  });

  it("ignore une valeur corrompue", () => {
    expect(parseConsent("%7Bpas-du-json")).toBeNull();
    expect(parseConsent(encodeURIComponent(JSON.stringify({ v: 999, at: "", choices: {} })))).toBeNull();
  });

  it("n'affiche aucun bandeau en V1 (aucun traceur optionnel installé)", () => {
    expect(optionalCategoriesWithTools()).toHaveLength(0);
  });
});
