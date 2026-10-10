// Crée .env.local pour le développement, à partir de Supabase local (« npm run db:start » d'abord).
// Usage : npm run env:local
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

if (existsSync(".env.local") && !process.argv.includes("--force")) {
  console.log(".env.local existe déjà. Relancez avec --force pour le remplacer.");
  process.exit(0);
}

const status = JSON.parse(execFileSync("npx", ["supabase", "status", "-o", "json"], { encoding: "utf8" }));
const lines = [
  "# Généré par scripts/setup-local-env.mjs pour Supabase local. Ne pas commiter.",
  "NEXT_PUBLIC_SITE_URL=http://localhost:3000",
  `NEXT_PUBLIC_SUPABASE_URL=${status.API_URL}`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${status.PUBLISHABLE_KEY}`,
  `SUPABASE_SECRET_KEY=${status.SECRET_KEY}`,
  `IP_HASH_SECRET=${randomBytes(32).toString("hex")}`,
];
writeFileSync(".env.local", lines.join("\n") + "\n", { mode: 0o600 });
console.log(".env.local créé pour Supabase local.");
