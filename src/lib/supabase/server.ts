import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getPublicSupabaseConfig } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Client Supabase lié à la session de l'utilisateur (cookies). Les droits sont ceux de
 * l'utilisateur : la RLS s'applique. À appeler sous <Suspense> dans un composant serveur,
 * ou dans une action serveur. Renvoie `null` si Supabase n'est pas configuré.
 */
export async function createSupabaseServerClient() {
  const config = getPublicSupabaseConfig();
  if (!config) return null;

  // Le client lit l'heure à sa création (expiration du jeton) : la lecture doit avoir lieu au
  // moment de la requête, jamais pendant le pré-rendu (Next.js, « blocking-prerender-current-time »).
  await connection();
  const cookieStore = await cookies();
  return createServerClient<Database>(config.supabaseUrl, config.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appel depuis un composant serveur : l'écriture est impossible ici, le proxy
          // (src/proxy.ts) se charge de rafraîchir la session à chaque requête.
        }
      },
    },
  });
}

export type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
