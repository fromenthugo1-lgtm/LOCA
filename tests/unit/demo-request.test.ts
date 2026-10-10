import { describe, expect, it } from "vitest";
import { checkAntiSpam, demoRequestSchema, MIN_FILL_TIME_MS } from "@/features/demo-requests/schema";
import { hashIdentifier } from "@/lib/security/ip";

const valid = {
  fullName: "Camille Martin",
  email: "  Camille@Exemple.FR ",
  companyName: "Martin Paysage",
  jobTitle: "Gérante",
  sector: "paysagisme",
  companySize: "",
  phone: "",
  message: "",
};

describe("demande de démonstration : validation", () => {
  it("accepte une demande complète et normalise l'e-mail", () => {
    const r = demoRequestSchema.parse(valid);
    expect(r.email).toBe("camille@exemple.fr");
    expect(r.companySize).toBeNull();
    expect(r.phone).toBeNull();
    expect(r.message).toBeNull();
  });

  it("refuse les champs obligatoires vides", () => {
    const r = demoRequestSchema.safeParse({ ...valid, fullName: " ", companyName: "", sector: "" });
    expect(r.success).toBe(false);
    const fields = r.error?.issues.map((i) => i.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["fullName", "companyName", "sector"]));
  });

  it("refuse un secteur hors liste, un e-mail ou un téléphone invalide", () => {
    expect(demoRequestSchema.safeParse({ ...valid, sector: "pirate" }).success).toBe(false);
    expect(demoRequestSchema.safeParse({ ...valid, email: "pas-un-email" }).success).toBe(false);
    expect(demoRequestSchema.safeParse({ ...valid, phone: "appelez-moi" }).success).toBe(false);
    expect(demoRequestSchema.safeParse({ ...valid, phone: "+33 6 12 34 56 78" }).success).toBe(true);
  });

  it("limite la longueur du besoin", () => {
    expect(demoRequestSchema.safeParse({ ...valid, message: "a".repeat(2001) }).success).toBe(false);
  });
});

describe("demande de démonstration : anti-robot", () => {
  it("rejette le champ piège rempli", () => {
    expect(checkAntiSpam({ honeypot: "http://spam", elapsedMs: 10_000 })).toEqual({ ok: false, reason: "honeypot" });
  });
  it("rejette un envoi trop rapide ou sans durée", () => {
    expect(checkAntiSpam({ honeypot: "", elapsedMs: MIN_FILL_TIME_MS - 1 }).ok).toBe(false);
    expect(checkAntiSpam({ honeypot: "", elapsedMs: Number.NaN }).ok).toBe(false);
  });
  it("accepte un envoi humain", () => {
    expect(checkAntiSpam({ honeypot: "", elapsedMs: 8000 })).toEqual({ ok: true });
  });
});

describe("empreinte des adresses IP", () => {
  it("est stable, non réversible et dépend du secret", () => {
    const a = hashIdentifier("203.0.113.7", "s".repeat(32));
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toContain("203");
    expect(hashIdentifier("203.0.113.7", "s".repeat(32))).toBe(a);
    expect(hashIdentifier("203.0.113.7", "t".repeat(32))).not.toBe(a);
  });
});
