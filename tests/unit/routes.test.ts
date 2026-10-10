import { describe, expect, it } from "vitest";
import { safeInternalPath } from "@/config/routes";

describe("redirection après connexion", () => {
  it("accepte un chemin interne", () => {
    expect(safeInternalPath("/espace")).toBe("/espace");
    expect(safeInternalPath("/admin/demandes?statut=new")).toBe("/admin/demandes?statut=new");
  });
  it("refuse une adresse externe (redirection ouverte)", () => {
    expect(safeInternalPath("https://exemple.com")).toBe("/espace");
    expect(safeInternalPath("//exemple.com")).toBe("/espace");
    expect(safeInternalPath("/\\exemple.com")).toBe("/espace");
    expect(safeInternalPath(null)).toBe("/espace");
  });
});

describe("redirection après connexion : contournements connus", () => {
  it.each(["/\t/exemple.com", "/\n/exemple.com", "/\r/exemple.com", "/%09/exemple.com".replace("%09", "\t"), "/\\/exemple.com", "///exemple.com"])(
    "refuse %j",
    (value) => {
      expect(safeInternalPath(value)).toBe("/espace");
    },
  );
  it("garde le chemin et la requête d'un lien interne", () => {
    expect(safeInternalPath("/reinitialiser-mot-de-passe")).toBe("/reinitialiser-mot-de-passe");
    expect(safeInternalPath("/admin/comptes?statut=active")).toBe("/admin/comptes?statut=active");
  });
});
