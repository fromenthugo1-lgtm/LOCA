import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { makeTestCredential, openEmailLink, sql, uniqueEmail, waitForEmailHtml } from "./helpers";

const publicPages = [
  "/",
  "/demo",
  "/tarifs",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
  "/cgu",
  "/cgv",
  "/connexion",
  "/inscription",
  "/mot-de-passe-oublie",
  "/verifier-email",
  "/page-qui-n-existe-pas",
];

async function axe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return results.violations.map((v) => `${v.id} (${v.impact}) : ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`);
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.describe("accessibilité et affichage des pages publiques", () => {
  for (const path of publicPages) {
    test(`${path} : WCAG 2.1 AA (axe), une seule h1, pas de débordement`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await axe(page)).toEqual([]);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    });
  }
});

test("pages connectées : espace client et administration", async ({ page }) => {
  test.setTimeout(180_000);
  sql("delete from public.rate_limit_events where action like 'sign%'");
  const email = uniqueEmail("a11y");
  const secret = makeTestCredential();
  await page.goto("/inscription");
  await page.getByLabel("E-mail professionnel").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(secret);
  await page.getByLabel("Confirmez le mot de passe").fill(secret);
  await page.getByLabel(/J'ai lu et j'accepte/).check();
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await openEmailLink(page, await waitForEmailHtml(email, "Confirmez votre adresse"));
  await expect(page.getByRole("heading", { name: "Mon espace" })).toBeVisible();
  sql(`insert into public.platform_admins (user_id) select id from auth.users where email = '${email}'`);

  const privatePages = [
    "/espace",
    "/admin",
    "/admin/demandes",
    "/admin/comptes",
    "/admin/entreprises",
    "/admin/entreprises/nouvelle",
    "/admin/formules",
    "/admin/formules/nouvelle",
    "/admin/contenus",
    "/admin/contenus/home.hero",
    "/admin/faq",
    "/admin/juridique",
    "/admin/juridique/cgu",
    "/admin/rgpd",
    "/admin/journal",
  ];
  for (const path of privatePages) {
    await page.goto(path, { waitUntil: "networkidle" });
    expect.soft(await axe(page), path).toEqual([]);
    await expect.soft(page.locator("h1"), path).toHaveCount(1);
    expect.soft(await horizontalOverflow(page), path).toBeLessThanOrEqual(0);
  }
});

test.describe("navigation au clavier", () => {
  test("lien d'évitement puis navigation principale", async ({ page, isMobile }) => {
    test.skip(isMobile, "Navigation au clavier testée sur ordinateur");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Aller au contenu" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#contenu$/);
  });

  test("formulaire de démo entièrement utilisable au clavier", async ({ page, isMobile }) => {
    test.skip(isMobile, "Navigation au clavier testée sur ordinateur");
    await page.goto("/demo");
    await page.getByLabel("Nom et prénom").focus();
    const order: string[] = [];
    for (let i = 0; i < 9; i++) {
      order.push(await page.evaluate(() => document.activeElement?.getAttribute("name") ?? document.activeElement?.textContent ?? ""));
      await page.keyboard.press("Tab");
    }
    expect(order.slice(0, 8)).toEqual(["fullName", "email", "companyName", "jobTitle", "sector", "companySize", "phone", "message"]);
  });

  test("menu mobile : ouverture, focus piégé, fermeture par Échap", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Menu mobile");
    await page.goto("/");
    const open = page.getByRole("button", { name: "Ouvrir le menu" });
    await open.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Fonctionnement" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
  });

  test("gestion des cookies accessible depuis le pied de page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Gérer les cookies" }).click();
    const dialog = page.getByRole("dialog", { name: "Gérer les cookies" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Tout refuser" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Tout accepter" })).toBeVisible();
    await dialog.getByRole("button", { name: "Tout refuser" }).click();
    await expect(dialog).toBeHidden();
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "se_consent")).toBeTruthy();
  });
});

test("animations réduites : aucune transition quand l'utilisateur le demande", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const duration = await page.evaluate(() => getComputedStyle(document.querySelector("h1")!.parentElement!).animationDuration);
  expect(["0s", "0ms"]).toContain(duration);
});
