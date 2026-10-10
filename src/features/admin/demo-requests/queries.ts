import "server-only";
import { adminDb } from "../client";
import type { Database } from "@/lib/supabase/database.types";

type Status = Database["public"]["Enums"]["demo_request_status"];
export const demoStatuses: Status[] = ["new", "in_progress", "done", "refused"];

export async function listDemoRequests(status: Status | null) {
  const { supabase } = await adminDb();
  let query = supabase
    .from("demo_requests")
    .select("id, created_at, full_name, company_name, sector, status")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(`demo_requests: ${error.code}`);
  return data;
}

/** Détail d'une demande ; la consultation est journalisée en base. */
export async function getDemoRequest(id: string) {
  const { supabase } = await adminDb();
  const { data, error } = await supabase.rpc("admin_view_demo_request", { p_id: id });
  if (error) throw new Error(`demo_request: ${error.code}`);
  return data[0] ?? null;
}
