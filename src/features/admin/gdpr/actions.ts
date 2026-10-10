"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminDb } from "../client";
import { dbError, invalid, type ActionState } from "../action-state";

const types = ["access", "rectification", "erasure", "restriction", "portability", "objection", "consent_withdrawal"] as const;
const statuses = ["received", "identity_check", "in_progress", "completed", "rejected"] as const;

export async function createGdprRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = z
    .object({
      requestType: z.enum(types, "Type de demande invalide."),
      requesterEmail: z.string().trim().toLowerCase().pipe(z.email("E-mail du demandeur invalide.")),
      channel: z.enum(["email", "account", "post", "other"], "Canal invalide."),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { data: userId } = await supabase.rpc("admin_find_account_by_email", { p_email: parsed.data.requesterEmail });
  const { data, error } = await supabase
    .from("gdpr_requests")
    .insert({
      request_type: parsed.data.requestType,
      requester_email: parsed.data.requesterEmail,
      channel: parsed.data.channel,
      user_id: userId ?? null,
    })
    .select("id")
    .single();
  if (error) return dbError("enregistrement d'une demande RGPD", error);
  redirect(`/admin/rgpd/${data.id}`);
}

export async function updateGdprRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, ctx } = await adminDb();
  const parsed = z
    .object({
      id: z.uuid(),
      status: z.enum(statuses, "Statut invalide."),
      identityMethod: z.string().trim().max(200, "Vérification d'identité : 200 caractères au maximum."),
      identityVerified: z.boolean(),
      resolutionNote: z.string().trim().max(2000, "Trace du traitement : 2 000 caractères au maximum."),
    })
    .safeParse({ ...Object.fromEntries(formData), identityVerified: formData.get("identityVerified") === "on" });
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;
  const closing = d.status === "completed" || d.status === "rejected";
  if (closing && !d.resolutionNote) {
    return { status: "invalid", fieldErrors: { resolutionNote: "Indiquez ce qui a été fait avant de clôturer." } };
  }

  const { data: current, error: readError } = await supabase
    .from("gdpr_requests")
    .select("identity_verified_at, completed_at")
    .eq("id", d.id)
    .single();
  if (readError) return dbError("lecture d'une demande RGPD", readError);

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("gdpr_requests")
    .update({
      status: d.status,
      identity_method: d.identityMethod || null,
      identity_verified_at: d.identityVerified ? (current.identity_verified_at ?? now) : null,
      resolution_note: d.resolutionNote || null,
      completed_at: closing ? (current.completed_at ?? now) : null,
      handled_by: ctx.user.id,
    })
    .eq("id", d.id);
  if (error) return dbError("mise à jour d'une demande RGPD", error);
  revalidatePath(`/admin/rgpd/${d.id}`);
  return { status: "success", message: "Demande mise à jour." };
}
