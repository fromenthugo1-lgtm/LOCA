import { expect, test } from "@playwright/test";
import { sql, uniqueEmail } from "./helpers";

test.describe("formulaire de demande de démonstration", () => {
  test.beforeEach(() => {
    // Les limites anti-abus sont testées à part : on repart d'un compteur vide.
    sql("delete from public.rate_limit_events where action like 'demo_%'");
  });

  test("affiche les erreurs par champ sans rien envoyer", async ({ page }) => {
    await page.goto("/demo");
    await page.getByRole("button", { name: "Envoyer ma demande" }).click();
    await expect(page.getByText("Indiquez votre nom et votre prénom.")).toBeVisible();
    await expect(page.getByText("Indiquez une adresse e-mail valide.")).toBeVisible();
    await expect(page.getByText("Choisissez un secteur.")).toBeVisible();
    await expect(page.getByLabel("Nom et prénom")).toBeFocused();
  });

  test("enregistre réellement la demande puis confirme", async ({ page }) => {
    const email = uniqueEmail("demo");
    await page.goto("/demo");
    await page.getByLabel("Nom et prénom").fill("Camille Test");
    await page.getByLabel("E-mail professionnel").fill(email);
    await page.getByLabel("Entreprise", { exact: true }).fill("Entreprise Test");
    await page.getByLabel("Fonction", { exact: true }).fill("Gérante");
    await page.getByLabel("Secteur d'activité").selectOption("paysagisme");
    await page.getByLabel(/Votre besoin/).fill("Végétaux et terre, une dizaine de fournisseurs.");
    await page.waitForTimeout(3200);
    await page.getByRole("button", { name: "Envoyer ma demande" }).click();
    await expect(page.getByText("Votre demande est bien enregistrée.")).toBeVisible();
    expect(sql(`select count(*) from public.demo_requests where email = '${email}'`)).toBe("1");
    expect(sql(`select ip_hash ~ '^[0-9a-f]{64}$' from public.demo_requests where email = '${email}'`)).toBe("t");
  });

  test("refuse un envoi trop rapide (anti-robot)", async ({ page }) => {
    const email = uniqueEmail("rapide");
    await page.goto("/demo");
    await page.getByLabel("Nom et prénom").fill("Robot Rapide");
    await page.getByLabel("E-mail professionnel").fill(email);
    await page.getByLabel("Entreprise", { exact: true }).fill("Robots");
    await page.getByLabel("Fonction", { exact: true }).fill("Robot");
    await page.getByLabel("Secteur d'activité").selectOption("autre");
    await page.getByRole("button", { name: "Envoyer ma demande" }).click();
    await expect(page.getByText("La demande n'a pas été envoyée")).toBeVisible();
    expect(sql(`select count(*) from public.demo_requests where email = '${email}'`)).toBe("0");
  });

  test("bloque la 4e demande depuis la même connexion dans l'heure", async ({ page }) => {
    for (let i = 0; i < 4; i++) {
      await page.goto("/demo");
      await page.getByLabel("Nom et prénom").fill("Limite Test");
      await page.getByLabel("E-mail professionnel").fill(uniqueEmail(`limite${i}`));
      await page.getByLabel("Entreprise", { exact: true }).fill("Limite");
      await page.getByLabel("Fonction", { exact: true }).fill("Test");
      await page.getByLabel("Secteur d'activité").selectOption("btp");
      await page.waitForTimeout(3100);
      await page.getByRole("button", { name: "Envoyer ma demande" }).click();
      if (i < 3) await expect(page.getByText("Votre demande est bien enregistrée.")).toBeVisible();
    }
    await expect(page.getByText(/Plusieurs demandes ont déjà été envoyées/)).toBeVisible();
  });
});
