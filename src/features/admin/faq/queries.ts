import "server-only";
import { adminDb } from "../client";

export async function listFaqItems() {
  const { supabase } = await adminDb();
  const { data, error } = await supabase.from("faq_items").select("*").order("display_order").order("created_at");
  if (error) throw new Error(`faq: ${error.code}`);
  return data;
}
