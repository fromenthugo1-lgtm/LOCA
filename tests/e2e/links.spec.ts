import { expect, test } from "@playwright/test";

const startPages = ["/", "/demo", "/tarifs", "/contact", "/mentions-legales", "/confidentialite", "/cgu", "/cgv", "/connexion", "/inscription"];

test("aucun lien interne mort, aucun lien ou bouton sans destination", async ({ page, request, isMobile }) => {
  test.skip(isMobile, "Parcours des liens fait une fois, sur ordinateur");
  test.setTimeout(120_000);
  const links = new Set<string>();
  for (const path of startPages) {
    await page.goto(path);
    const hrefs = await page.$$eval("a", (as) => as.map((a) => a.getAttribute("href")));
    for (const href of hrefs) {
      expect(href, `lien sans destination sur ${path}`).toBeTruthy();
      expect(href, `lien vide sur ${path}`).not.toBe("#");
      if (href!.startsWith("/")) links.add(href!.split("#")[0] || "/");
    }
    // Chaque bouton hors formulaire doit avoir une action (menu, dialogue) : aucun bouton décoratif.
    const orphanButtons = await page.$$eval("button", (bs) =>
      bs.filter((b) => !b.closest("form") && !b.hasAttribute("aria-controls") && !b.hasAttribute("aria-haspopup") && !b.getAttribute("aria-label") && !b.textContent?.trim()).length,
    );
    expect(orphanButtons, `bouton sans libellé sur ${path}`).toBe(0);
  }
  for (const link of links) {
    const res = await request.get(link, { maxRedirects: 5 });
    expect(res.status(), `lien ${link}`).toBe(200);
  }
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  for (const loc of (await sitemap.text()).match(/<loc>[^<]+<\/loc>/g) ?? []) {
    const path = new URL(loc.replace(/<\/?loc>/g, "")).pathname;
    expect((await request.get(path)).status(), `sitemap ${path}`).toBe(200);
  }
  for (const asset of ["/robots.txt", "/favicon.ico", "/icon.svg", "/apple-icon.png", "/opengraph-image", "/manifest.webmanifest"]) {
    expect((await request.get(asset)).status(), asset).toBe(200);
  }
});

test("en-têtes de sécurité et absence de trace d'outil", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["x-powered-by"]).toBeUndefined();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"]).toContain("camera=()");
  const html = await res.text();
  expect(html).not.toMatch(/<meta name="generator"/i);
  expect(html).not.toMatch(/made with|built with|lorem ipsum/i);
  expect(html).toContain('lang="fr"');
  expect(html).toContain('property="og:image"');
  expect(html).toContain('"@type":"Organization"');
  expect(html).toContain('"@type":"FAQPage"');
});
