import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * État réel de l'abonnement de chaque entreprise, calculé en base (statut, période, essai).
 * Une page de confirmation de paiement ne vaut jamais abonnement : seul cet état compte.
 */
export async function getSubscriptionStates(companyIds: string[]): Promise<Map<string, boolean>> {
  const supabase = await createSupabaseServerClient();
  const states = new Map<string, boolean>();
  if (!supabase) return states;
  await Promise.all(
    companyIds.map(async (id) => {
      const { data, error } = await supabase.rpc("company_subscription_is_active", { p_company_id: id });
      if (error) console.error("[billing] état d'abonnement illisible", { code: error.code });
      states.set(id, data === true);
    }),
  );
  return states;
}
