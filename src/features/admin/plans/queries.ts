import "server-only";
import { adminDb } from "../client";

export async function listAllPlans() {
  const { supabase } = await adminDb();
  const { data, error } = await supabase
    .from("plans")
    .select("id, slug, name, monthly_price_cents, setup_fee_cents, is_published, archived_at, display_order")
    .order("archived_at", { ascending: true, nullsFirst: true })
    .order("display_order");
  if (error) throw new Error(`plans: ${error.code}`);
  return data;
}

export async function getPlan(id: string) {
  const { supabase } = await adminDb();
  const { data, error } = await supabase.from("plans").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`plan: ${error.code}`);
  return data;
}
