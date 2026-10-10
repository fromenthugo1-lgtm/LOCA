// Nomme un compte existant administrateur global (super_admin) de SpendEdge.
// Le compte doit d'abord être créé par l'inscription normale du site et son e-mail confirmé.
// Usage : npm run admin:create -- prenom.nom@exemple.fr
// Lit NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY depuis l'environnement ou .env.local.
// Ne jamais exposer cette opération dans l'interface : elle exige la clé secrète.
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}
loadEnvFile(".env.local");

const email = (process.argv[2] ?? "").trim().toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!email.includes("@")) {
  console.error("Indiquez l'e-mail du compte : npm run admin:create -- prenom.nom@exemple.fr");
  process.exit(1);
}
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY sont nécessaires (voir .env.example).");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

let user = null;
for (let page = 1; page <= 50 && !user; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
  if (error) {
    console.error("Lecture des comptes impossible :", error.message);
    process.exit(1);
  }
  user = data.users.find((u) => u.email?.toLowerCase() === email) ?? null;
  if (data.users.length < 200) break;
}

if (!user) {
  console.error(`Aucun compte pour ${email}. Inscrivez-vous d'abord sur le site, puis relancez.`);
  process.exit(1);
}
if (!user.email_confirmed_at) {
  console.error("L'adresse de ce compte n'est pas encore confirmée. Ouvrez l'e-mail de confirmation, puis relancez.");
  process.exit(1);
}

const { error } = await supabase.from("platform_admins").upsert({ user_id: user.id, note: "Créé par scripts/create-admin.mjs" });
if (error) {
  console.error("Nomination impossible :", error.message);
  process.exit(1);
}
console.log(`${email} est maintenant administrateur global. Connectez-vous puis ouvrez /admin.`);
