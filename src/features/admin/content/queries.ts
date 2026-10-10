import "server-only";
import { adminDb } from "../client";

export async function listContentRows() {
  const { supabase } = await adminDb();
  const { data, error } = await supabase.from("site_content").select("key, published_at, draft, updated_at");
  if (error) throw new Error(`site_content: ${error.code}`);
  return new Map(data.map((r) => [r.key, { publishedAt: r.published_at, hasDraft: r.draft !== null, updatedAt: r.updated_at }]));
}

export async function getContentRow(key: string) {
  const { supabase } = await adminDb();
  const { data, error } = await supabase.from("site_content").select("draft, published, published_at").eq("key", key).maybeSingle();
  if (error) throw new Error(`site_content: ${error.code}`);
  return data;
}
