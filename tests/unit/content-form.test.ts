import { describe, expect, it } from "vitest";
import { fromFormData, mergeOnReference } from "@/features/site-content/form-data";
import { siteContentDefaults } from "@/features/site-content/defaults";
import { siteContentSchemas } from "@/features/site-content/schemas";

describe("éditeur de contenus", () => {
  it("relit un formulaire en conservant la structure et les identifiants", () => {
    const ref = siteContentDefaults["home.problem"];
    const fd = new FormData();
    fd.set("title", "Nouveau titre");
    fd.set("items.1.text", "Nouveau texte");
    fd.set("items.1.id", "pirate");
    const out = fromFormData(ref, fd) as typeof ref;
    expect(out.title).toBe("Nouveau titre");
    expect(out.items[1].text).toBe("Nouveau texte");
    expect(out.items[1].id).toBe(ref.items[1].id);
    expect(out.items).toHaveLength(ref.items.length);
    expect(siteContentSchemas["home.problem"].safeParse(out).success).toBe(true);
  });

  it("ignore les clés inconnues d'une version enregistrée et complète les manques", () => {
    const ref = siteContentDefaults["home.finalCta"];
    const merged = mergeOnReference(ref, { title: "Titre modifié", inconnu: "x" }) as Record<string, string>;
    expect(merged.title).toBe("Titre modifié");
    expect(merged.cta).toBe(ref.cta);
    expect(merged).not.toHaveProperty("inconnu");
  });

  it("refuse un texte vide à la validation", () => {
    const fd = new FormData();
    fd.set("title", "   ");
    const out = fromFormData(siteContentDefaults["home.finalCta"], fd);
    expect(siteContentSchemas["home.finalCta"].safeParse(out).success).toBe(false);
  });
});
