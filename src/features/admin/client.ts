import "server-only";
import { requireSuperAdmin } from "@/features/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Point d'entrée unique des données d'administration : vérifie le rôle super_admin puis
 * renvoie le client lié à la session (la RLS s'applique aussi en base).
 */
export async function adminDb() {
  const ctx = await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase non configuré");
  return { supabase, ctx };
}
