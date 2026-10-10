import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/lib/env";
import { getServerSecrets } from "@/lib/env.server";
import type { Database } from "./database.types";

/**
 * Client avec la clé secrète : contourne la RLS. Usage strictement limité :
 * - fonctions anti-abus (`submit_demo_request`, `check_rate_limit`) ;
 * - API d'administration Auth (suppression douce d'un compte anonymisé).
 * Ne jamais l'utiliser pour lire des données à la place de l'utilisateur.
 */
export function createSupabaseAdminClient() {
  const config = getPublicSupabaseConfig();
  const secrets = getServerSecrets();
  if (!config || !secrets) return null;
  return createClient<Database>(config.supabaseUrl, secrets.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
