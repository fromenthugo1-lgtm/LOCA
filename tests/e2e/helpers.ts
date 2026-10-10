import { execFileSync } from "node:child_process";

/** Exécute une requête SQL sur la base Supabase locale (tests uniquement). */
export function sql(query: string): string {
  return execFileSync(
    "docker",
    ["exec", "-i", "supabase_db_spendedge", "psql", "-U", "postgres", "-d", "postgres", "-At", "-c", query],
    { encoding: "utf8" },
  ).trim();
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@exemple.test`;
}

const MAILPIT = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

/** Attend l'e-mail reçu par `to` dans Mailpit (boîte de test de Supabase local) et renvoie son HTML. */
export async function waitForEmailHtml(to: string, subjectIncludes: string, timeoutMs = 15_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`);
    const list = (await res.json()) as { messages: { ID: string; Subject: string }[] };
    const msg = list.messages.find((m) => m.Subject.includes(subjectIncludes));
    if (msg) {
      const full = (await (await fetch(`${MAILPIT}/api/v1/message/${msg.ID}`)).json()) as { HTML: string };
      return full.HTML;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Aucun e-mail « ${subjectIncludes} » reçu pour ${to}`);
}

/** Extrait le chemin /auth/confirm?... d'un e-mail (l'hôte du lien dépend de la config locale). */
export function confirmPathFrom(html: string): string {
  const match = /href="[^"]*?(\/auth\/confirm\?[^"]+)"/.exec(html);
  if (!match) throw new Error("Lien de confirmation introuvable");
  return match[1].replace(/&amp;/g, "&");
}

/** Identifiant de test robuste, généré à chaque exécution (aucune valeur en dur). */
export function makeTestCredential(): string {
  return `Essai-${crypto.randomUUID()}-A9`;
}
