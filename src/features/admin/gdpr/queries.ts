import "server-only";
import { adminDb } from "../client";

export async function listGdprRequests() {
  const { supabase } = await adminDb();
  const { data, error } = await supabase
    .from("gdpr_requests")
    .select("id, request_type, status, requester_email, received_at, due_at, completed_at")
    .order("received_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`gdpr: ${error.code}`);
  return data;
}

export async function getGdprRequest(id: string) {
  const { supabase } = await adminDb();
  const { data, error } = await supabase.from("gdpr_requests").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`gdpr: ${error.code}`);
  return data;
}

export async function listAuditLogs(table: string | null) {
  const { supabase } = await adminDb();
  let q = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300);
  if (table) q = q.eq("target_table", table);
  const { data, error } = await q;
  if (error) throw new Error(`audit: ${error.code}`);
  return data;
}
