import type { Database } from "@/lib/supabase/database.types";

export type AccountStatus = Database["public"]["Enums"]["account_status"];

export type AccountView = "terms_required" | "created" | "onboarding_pending" | "active" | "suspended";

/**
 * Ce que voit un utilisateur connecté, calculé uniquement à partir de l'état enregistré
 * en base (docs/SPEC.md §8.3). Un compte suspendu reste suspendu même sans CGU acceptées.
 */
export function resolveAccountView(input: {
  status: AccountStatus;
  acceptedTermsVersion: string | null;
  currentTermsVersion: string;
}): AccountView {
  if (input.status === "suspended") return "suspended";
  if (input.acceptedTermsVersion !== input.currentTermsVersion) return "terms_required";
  return input.status;
}

/** Seul un compte actif accède au produit. */
export function canUseProduct(view: AccountView): boolean {
  return view === "active";
}
