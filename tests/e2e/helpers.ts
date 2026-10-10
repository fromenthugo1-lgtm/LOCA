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
