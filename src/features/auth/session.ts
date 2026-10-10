import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = { id: string; email: string };

/**
 * Utilisateur connecté, vérifié par la signature du jeton (getClaims), ou null.
 * Mémorisé pour la durée d'une requête. À appeler sous <Suspense> ou dans une action.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: data.claims.sub, email: String(data.claims.email ?? "") };
});

export type AccountContext = {
  user: SessionUser;
  profile: {
    fullName: string | null;
    status: "created" | "onboarding_pending" | "active" | "suspended";
    termsVersion: string | null;
    deletionRequestedAt: string | null;
  };
  isSuperAdmin: boolean;
  companies: { id: string; name: string; role: "member" | "company_admin" }[];
};

/** Profil, rôle plateforme et entreprises de l'utilisateur connecté, lus avec ses droits (RLS). */
export const getAccountContext = cache(async (): Promise<AccountContext | null> => {
  const user = await getSessionUser();
  const supabase = await createSupabaseServerClient();
  if (!user || !supabase) return null;

  const [profileRes, adminRes, membersRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, account_status, terms_version, deletion_requested_at")
      .eq("id", user.id)
      .single(),
    supabase.rpc("current_user_is_super_admin"),
    supabase.from("company_members").select("role, companies(id, name)").eq("user_id", user.id),
  ]);

  if (profileRes.error) {
    console.error("[auth] profil introuvable", { code: profileRes.error.code });
    return null;
  }

  return {
    user,
    profile: {
      fullName: profileRes.data.full_name,
      status: profileRes.data.account_status,
      termsVersion: profileRes.data.terms_version,
      deletionRequestedAt: profileRes.data.deletion_requested_at,
    },
    isSuperAdmin: adminRes.data === true,
    companies: (membersRes.data ?? []).flatMap((m) =>
      m.companies ? [{ id: m.companies.id, name: m.companies.name, role: m.role }] : [],
    ),
  };
});
