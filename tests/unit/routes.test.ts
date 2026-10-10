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
