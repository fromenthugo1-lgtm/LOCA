import "server-only";
import { adminDb } from "./client";

/** Éléments à traiter, comptés sur les données réelles (aucune statistique simulée). */
export async function getAdminOverview() {
  const { supabase } = await adminDb();
  const count = async (q: PromiseLike<{ count: number | null; error: { code?: string } | null }>) => {
    const { count: c, error } = await q;
    if (error) throw new Error(`overview: ${error.code}`);
    return c ?? 0;
  };
  const [newDemos, pendingOnboarding, openGdpr, lateGdpr] = await Promise.all([
    count(supabase.from("demo_requests").select("id", { count: "exact", head: true }).eq("status", "new")),
    count(supabase.from("profiles").select("id", { count: "exact", head: true }).eq("account_status", "onboarding_pending")),
    count(supabase.from("gdpr_requests").select("id", { count: "exact", head: true }).not("status", "in", "(completed,rejected)")),
    count(
      supabase
        .from("gdpr_requests")
        .select("id", { count: "exact", head: true })
        .not("status", "in", "(completed,rejected)")
        .lt("due_at", new Date().toISOString()),
    ),
  ]);
  const { data: deletions, error } = await supabase
    .from("profiles")
    .select("id")
    .not("deletion_requested_at", "is", null)
    .is("anonymized_at", null);
  if (error) throw new Error(`overview: ${error.code}`);
  return { newDemos, pendingOnboarding, openGdpr, lateGdpr, pendingDeletions: deletions.length };
}
