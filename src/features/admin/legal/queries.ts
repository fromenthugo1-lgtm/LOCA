import "server-only";
import { adminDb } from "../client";

export async function listLegalVersions(slug: string) {
  const { supabase } = await adminDb();
  const { data, error } = await supabase
    .from("legal_page_versions")
    .select("version, published_at")
    .eq("slug", slug)
    .order("published_at", { ascending: false });
  if (error) throw new Error(`legal_versions: ${error.code}`);
  return data;
}
