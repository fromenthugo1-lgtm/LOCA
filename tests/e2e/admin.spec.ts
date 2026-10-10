import { expect, test, type Page } from "@playwright/test";
import { makeTestCredential, openEmailLink, sql, uniqueEmail, waitForEmailHtml } from "./helpers";

/** Crée un compte confirmé via le site, le nomme super_admin en base, et le connecte. */
async function signInAsNewAdmin(page: Page): Promise<string> {
  sql("delete from public.rate_limit_events where action like 'sign%'");
  const email = uniqueEmail("admin");
  const secret = makeTestCredential();
  await page.goto("/inscription");
  await page.getByLabel("E-mail professionnel").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(secret);
  await page.getByLabel("Confirmez le mot de passe").fill(secret);
  await page.getByLabel(/J'ai lu et j'accepte/).check();
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await openEmailLink(page, await waitForEmailHtml(email, "Confirmez votre adresse"));
  await expect(page).toHaveURL(/\/espace/);
  sql(`insert into public.platform_admins (user_id) select id from auth.users where email = '${email}'`);
  return email;
}

test.describe.configure({ mode: "serial" });

test("l'administrateur traite une demande de démo et l'action est journalisée", async ({ page }) => {
  const prospect = uniqueEmail("prospect");
  sql(
    `insert into public.demo_requests (full_name, email, company_name, job_title, sector) values ('Prospect Test', '${prospect}', 'Prospect SARL', 'Gérant', 'btp')`,
  );
  await signInAsNewAdmin(page);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Vue d'ensemble" })).toBeVisible();

  await page.goto("/admin/demandes");
  await page.getByRole("link", { name: "Prospect Test" }).first().click();
  await expect(page.getByText(prospect)).toBeVisible();
  await page.getByLabel("Statut").selectOption("in_progress");
  await page.getByLabel(/Notes internes/).fill("Rappel prévu mardi.");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Demande mise à jour.")).toBeVisible();

  expect(sql(`select status from public.demo_requests where email = '${prospect}'`)).toBe("in_progress");
  expect(Number(sql(`select count(*) from public.audit_logs l join public.demo_requests d on d.id::text = l.target_id where d.email = '${prospect}' and l.action in ('demo_request_viewed','update')`))).toBeGreaterThanOrEqual(2);
});

test("une formule publiée apparaît sur la page Tarifs sans redéploiement", async ({ page }) => {
  await signInAsNewAdmin(page);
  const slug = `essai-${Date.now()}`;
  await page.goto("/admin/formules/nouvelle");
  await page.getByLabel("Nom affiché").fill("Formule Essai");
  await page.getByLabel("Identifiant").fill(slug);
  await page.getByLabel(/Abonnement mensuel/).fill("49,90");
  await page.getByLabel(/Fonctionnalités incluses/).fill("Une première fonctionnalité");
  await page.getByLabel("Publiée sur le site").check();
  await page.getByRole("button", { name: "Créer la formule" }).click();
  await expect(page.getByRole("heading", { name: "Formule Essai" })).toBeVisible();
  expect(sql(`select monthly_price_cents from public.plans where slug = '${slug}'`)).toBe("4990");

  await page.goto("/tarifs");
  await expect(page.getByRole("heading", { name: "Formule Essai" })).toBeVisible();
  await expect(page.getByText(/49,90/)).toBeVisible();

  // Archivage : la formule disparaît du site.
  await page.goto("/admin/formules");
  await page.getByRole("link", { name: "Formule Essai" }).click();
  await page.getByRole("button", { name: "Archiver la formule" }).click();
  await expect(page).toHaveURL(/\/admin\/formules$/);
  await page.goto("/tarifs");
  await expect(page.getByRole("heading", { name: "Formule Essai" })).toHaveCount(0);
});

test("un texte publié depuis l'administration s'affiche sur le site, puis revient au défaut", async ({ page }) => {
  await signInAsNewAdmin(page);
  await page.goto("/admin/contenus/home.finalCta");
  const marker = `Texte de test ${Date.now()}`;
  await page.getByLabel("Texte", { exact: true }).fill(marker);
  await page.getByRole("button", { name: "Publier sur le site" }).click();
  await expect(page.getByText("Texte publié : il est en ligne sur le site.")).toBeVisible();
  await page.goto("/");
  await expect(page.getByText(marker)).toBeVisible();

  await page.goto("/admin/contenus/home.finalCta");
  await page.getByRole("button", { name: "Revenir au texte par défaut" }).click();
  await expect(page.getByText("Le texte par défaut est de nouveau affiché sur le site.")).toBeVisible();
  await page.goto("/");
  await expect(page.getByText(marker)).toHaveCount(0);
});

test("activation d'un compte, rattachement à une entreprise et isolation", async ({ page, browser }) => {
  // Un client s'inscrit dans un autre navigateur.
  const clientPage = await (await browser.newContext()).newPage();
  const clientEmail = uniqueEmail("client");
  const secret = makeTestCredential();
  await clientPage.goto("/inscription");
  await clientPage.getByLabel("E-mail professionnel").fill(clientEmail);
  await clientPage.getByLabel("Mot de passe", { exact: true }).fill(secret);
  await clientPage.getByLabel("Confirmez le mot de passe").fill(secret);
  await clientPage.getByLabel(/J'ai lu et j'accepte/).check();
  await clientPage.getByRole("button", { name: "Créer mon compte" }).click();
  await openEmailLink(clientPage, await waitForEmailHtml(clientEmail, "Confirmez votre adresse"));

  await signInAsNewAdmin(page);
  const companyName = `Entreprise ${Date.now()}`;
  await page.goto("/admin/entreprises/nouvelle");
  await page.getByLabel("Nom de l'entreprise").fill(companyName);
  await page.getByLabel(/Notes internes/).fill("Note confidentielle SpendEdge");
  await page.getByRole("button", { name: "Créer l'entreprise" }).click();
  await expect(page.getByRole("heading", { name: companyName })).toBeVisible();
  await page.getByLabel("E-mail du compte").fill(clientEmail);
  await page.getByRole("button", { name: "Rattacher" }).click();
  await expect(page.getByText("Compte rattaché à l'entreprise.")).toBeVisible();

  await page.getByRole("link", { name: clientEmail }).click();
  await page.getByLabel("Nouveau statut").selectOption("active");
  await page.getByRole("button", { name: "Appliquer le statut" }).click();
  await expect(page.getByText(/Statut mis à jour/)).toBeVisible();

  await clientPage.goto("/espace");
  await expect(clientPage.getByText(companyName)).toBeVisible();
  // Les notes internes ne sont jamais renvoyées au client.
  await expect(clientPage.getByText("Note confidentielle SpendEdge")).toHaveCount(0);
  // Le client n'accède pas à l'administration.
  const res = await clientPage.goto("/admin/entreprises");
  expect(res?.status()).toBe(404);
});

test("demande RGPD : enregistrement, clôture motivée, export JSON", async ({ page }) => {
  const adminEmail = await signInAsNewAdmin(page);
  await page.goto("/admin/rgpd");
  await page.getByLabel("Type de demande").selectOption("access");
  await page.getByLabel("E-mail du demandeur").fill(adminEmail);
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByRole("heading", { name: "Demande : Accès" })).toBeVisible();

  await page.getByLabel("Statut").selectOption("completed");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Indiquez ce qui a été fait avant de clôturer.")).toBeVisible();
  await page.getByLabel(/Trace du traitement/).fill("Export envoyé par e-mail.");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Demande mise à jour.")).toBeVisible();

  const res = await page.request.get(`/admin/rgpd/export?email=${encodeURIComponent(adminEmail)}`);
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.email).toBe(adminEmail);
  expect(json.account.email).toBe(adminEmail);
  expect(sql(`select count(*) > 0 from public.audit_logs where action = 'personal_data_exported'`)).toBe("t");
});
