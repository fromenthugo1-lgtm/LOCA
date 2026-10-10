import "server-only";
import { adminDb } from "../client";

export async function listCompanies() {
  const { supabase } = await adminDb();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, sector, status, created_at, company_members(count)")
    .order("name");
  if (error) throw new Error(`companies: ${error.code}`);
  return data.map((c) => ({ ...c, memberCount: c.company_members[0]?.count ?? 0 }));
}

export async function getCompany(id: string) {
  const { supabase } = await adminDb();
  const [company, members, notes] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).maybeSingle(),
    supabase.rpc("admin_list_company_members", { p_company_id: id }),
    supabase.from("company_internal_notes").select("notes").eq("company_id", id).maybeSingle(),
  ]);
  if (company.error) throw new Error(`company: ${company.error.code}`);
  if (members.error) throw new Error(`members: ${members.error.code}`);
  if (notes.error) throw new Error(`notes: ${notes.error.code}`);
  return company.data
    ? { company: { ...company.data, notes: notes.data?.notes ?? null }, members: members.data }
    : null;
}
