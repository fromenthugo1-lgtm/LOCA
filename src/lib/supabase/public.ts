import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Client sans session (rôle anon) pour lire les contenus publics publiés. Utilisable dans
 * une fonction 'use cache' : il ne lit aucun cookie.
 */
export function createSupabasePublicClient() {
  const config = getPublicSupabaseConfig();
  if (!config) return null;
  return createClient<Database>(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
