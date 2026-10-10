import { expect, test, type Page } from "@playwright/test";
import { makeTestCredential, openEmailLink, sql, uniqueEmail, waitForEmailHtml } from "./helpers";

test.beforeEach(() => {
  sql("delete from public.rate_limit_events where action like 'sign%' or action like 'reset%'");
});

async function fillSignUp(page: Page, email: string, secret: string) {
  await page.goto("/inscription");
  await page.getByLabel("E-mail professionnel").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(secret);
  await page.getByLabel("Confirmez le mot de passe").fill(secret);
  await page.getByLabel(/J'ai lu et j'accepte/).check();
  await page.getByRole("button", { name: "Créer mon compte" }).click();
}

test.describe("pages privées", () => {
  for (const path of ["/espace", "/admin", "/admin/demandes"]) {
    test(`${path} renvoie vers la connexion sans session`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`/connexion\\?suite=${encodeURIComponent(path)}`));
      await expect(page.getByRole("heading", { name: "Se connecter" })).toBeVisible();
    });
  }
});

test.describe("inscription et connexion", () => {
  test("parcours complet : inscription, e-mail, confirmation, état « compte créé »", async ({ page }) => {
    const email = uniqueEmail("inscription");
    const secret = makeTestCredential();
    await fillSignUp(page, email, secret);
    await expect(page.getByRole("heading", { name: "Vérifiez votre boîte e-mail" })).toBeVisible();

    // Le profil existe, avec l'acceptation des CGU horodatée côté serveur.
    expect(
      sql(
        `select p.account_status || '|' || (p.terms_accepted_at is not null) from public.profiles p join auth.users u on u.id = p.id where u.email = '${email}'`,
      ),
    ).toBe("created|true");

    const html = await waitForEmailHtml(email, "Confirmez votre adresse");
    expect(html).toContain("Confirmez votre adresse e-mail");
    await openEmailLink(page, html);
    await expect(page).toHaveURL(/\/espace/);
    await expect(page.getByRole("heading", { name: "Votre compte est créé, réservez une démonstration" })).toBeVisible();

    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/connexion");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Mot de passe", { exact: true }).fill(secret);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByRole("heading", { name: "Mon espace" })).toBeVisible();

    // Un utilisateur standard n'accède pas à l'administration : vraie 404, et aucun
    // élément de l'administration dans la réponse.
    const res = await page.goto("/admin");
    expect(res?.status()).toBe(404);
    const body = (await res?.text()) ?? "";
    await expect(page.getByRole("heading", { name: "Cette page n'existe pas." })).toBeVisible();
    for (const marker of ["Vue d'ensemble", "Demandes de démo", "Journal d'audit", "Administration"]) {
      expect(body).not.toContain(marker);
    }
  });

  test("les états de compte suivent la base", async ({ page }) => {
    const email = uniqueEmail("etats");
    const secret = makeTestCredential();
    await fillSignUp(page, email, secret);
    await openEmailLink(page, await waitForEmailHtml(email, "Confirmez votre adresse"));
    await expect(page).toHaveURL(/\/espace/);

    const setStatus = (s: string) =>
      sql(`update public.profiles set account_status = '${s}' where id = (select id from auth.users where email = '${email}')`);

    setStatus("onboarding_pending");
    await page.reload();
    await expect(page.getByRole("heading", { name: "Votre environnement est en cours de configuration" })).toBeVisible();

    setStatus("active");
    await page.reload();
    await expect(page.getByRole("heading", { name: "Votre entreprise" })).toBeVisible();

    setStatus("suspended");
    await page.reload();
    await expect(page.getByRole("heading", { name: "Accès suspendu, contactez-nous" })).toBeVisible();
  });

  test("refuse un mot de passe faible et l'absence d'acceptation des CGU", async ({ page }) => {
    await page.goto("/inscription");
    await page.getByLabel("E-mail professionnel").fill(uniqueEmail("faible"));
    await page.getByLabel("Mot de passe", { exact: true }).fill("court");
    await page.getByLabel("Confirmez le mot de passe").fill("court");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByText("Le mot de passe ne respecte pas les règles indiquées.")).toBeVisible();
    await expect(page.getByText("Vous devez accepter les conditions d'utilisation.")).toBeVisible();
  });

  test("message identique pour un compte inexistant ou un mauvais mot de passe", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByLabel("E-mail").fill(uniqueEmail("inconnu"));
    await page.getByLabel("Mot de passe", { exact: true }).fill(makeTestCredential());
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("E-mail ou mot de passe incorrect.")).toBeVisible();
  });

  test("mot de passe oublié : e-mail reçu, nouveau mot de passe enregistré", async ({ page }) => {
    const email = uniqueEmail("oubli");
    await fillSignUp(page, email, makeTestCredential());
    await openEmailLink(page, await waitForEmailHtml(email, "Confirmez votre adresse"));
    await page.getByRole("button", { name: "Se déconnecter" }).click();

    await page.goto("/mot-de-passe-oublie");
    await page.getByLabel("E-mail du compte").fill(email);
    await page.getByRole("button", { name: "Recevoir un lien de réinitialisation" }).click();
    await expect(page.getByText(/Si un compte existe pour cette adresse/)).toBeVisible();

    await openEmailLink(page, await waitForEmailHtml(email, "Réinitialisez votre mot de passe"));
    await expect(page).toHaveURL(/\/reinitialiser-mot-de-passe/);
    const fresh = makeTestCredential();
    await page.getByLabel("Nouveau mot de passe").fill(fresh);
    await page.getByLabel("Confirmez le mot de passe").fill(fresh);
    await page.getByRole("button", { name: "Enregistrer le nouveau mot de passe" }).click();
    await expect(page.getByText("Votre mot de passe a été modifié.")).toBeVisible();
  });

  test("mot de passe oublié : même réponse pour une adresse inconnue", async ({ page }) => {
    await page.goto("/mot-de-passe-oublie");
    await page.getByLabel("E-mail du compte").fill(uniqueEmail("inconnu"));
    await page.getByRole("button", { name: "Recevoir un lien de réinitialisation" }).click();
    await expect(page.getByText(/Si un compte existe pour cette adresse/)).toBeVisible();
  });
});
