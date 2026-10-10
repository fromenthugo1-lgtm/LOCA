import { describe, expect, it } from "vitest";
import { canUseProduct, resolveAccountView } from "@/features/auth/account-view";
import { passwordRules, signUpSchema } from "@/features/auth/schema";

const base = { acceptedTermsVersion: "v1", currentTermsVersion: "v1" } as const;

describe("accès selon l'état du compte", () => {
  it("suit le statut enregistré en base", () => {
    expect(resolveAccountView({ ...base, status: "created" })).toBe("created");
    expect(resolveAccountView({ ...base, status: "onboarding_pending" })).toBe("onboarding_pending");
    expect(resolveAccountView({ ...base, status: "active" })).toBe("active");
    expect(resolveAccountView({ ...base, status: "suspended" })).toBe("suspended");
  });

  it("redemande l'acceptation quand la version des CGU a changé ou manque", () => {
    expect(resolveAccountView({ ...base, status: "active", acceptedTermsVersion: "v0" })).toBe("terms_required");
    expect(resolveAccountView({ ...base, status: "created", acceptedTermsVersion: null })).toBe("terms_required");
  });

  it("garde un compte suspendu suspendu, même sans CGU acceptées", () => {
    expect(resolveAccountView({ ...base, status: "suspended", acceptedTermsVersion: null })).toBe("suspended");
  });

  it("n'ouvre le produit qu'aux comptes actifs", () => {
    expect(canUseProduct("active")).toBe(true);
    for (const v of ["created", "onboarding_pending", "suspended", "terms_required"] as const) {
      expect(canUseProduct(v)).toBe(false);
    }
  });
});

describe("règles de mot de passe", () => {
  const strong = ["Abcdefghijk", "1"].join("");
  it("exige 12 caractères, minuscule, majuscule et chiffre", () => {
    expect(passwordRules.every((r) => r.test(strong))).toBe(true);
    expect(passwordRules.every((r) => r.test("abcdefghijk1"))).toBe(false);
    expect(passwordRules.every((r) => r.test("Abc1"))).toBe(false);
  });

  it("exige la confirmation identique et l'acceptation des CGU", () => {
    const ok = { email: "a@exemple.fr", password: strong, passwordConfirm: strong, acceptTerms: "on" };
    expect(signUpSchema.safeParse(ok).success).toBe(true);
    expect(signUpSchema.safeParse({ ...ok, passwordConfirm: `${strong}x` }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...ok, acceptTerms: "" }).success).toBe(false);
  });
});
