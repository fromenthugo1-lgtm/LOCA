import "server-only";
import { adminDb } from "../client";
import type { Database } from "@/lib/supabase/database.types";

export type AccountStatus = Database["public"]["Enums"]["account_status"];
export const accountStatuses: AccountStatus[] = ["created", "onboarding_pending", "active", "suspended"];

export async function listAccounts(search: string | null, status: AccountStatus | null) {
  const { supabase } = await adminDb();
  const { data, error } = await supabase.rpc("admin_list_accounts", {
    p_search: search ?? undefined,
    p_status: status ?? undefined,
    p_limit: 200,
  });
  if (error) throw new Error(`accounts: ${error.code}`);
  return data;
}

/** Détail d'un compte (consultation journalisée) et ses entreprises. */
export async function getAccount(userId: string) {
  const { supabase, ctx } = await adminDb();
  const [{ data, error }, memberships] = await Promise.all([
    supabase.rpc("admin_get_account", { p_user_id: userId }),
    supabase.from("company_members").select("company_id, role, companies(name)").eq("user_id", userId),
  ]);
  if (error) throw new Error(`account: ${error.code}`);
  if (memberships.error) throw new Error(`memberships: ${memberships.error.code}`);
  const account = data[0] ?? null;
  return account
    ? {
        account,
        isSelf: account.id === ctx.user.id,
        memberships: memberships.data.map((m) => ({ companyId: m.company_id, role: m.role, name: m.companies?.name ?? "" })),
      }
    : null;
}
