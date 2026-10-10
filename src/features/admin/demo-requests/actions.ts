"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminDb } from "../client";
import { dbError, invalid, type ActionState } from "../action-state";

const schema = z.object({
  id: z.uuid(),
  status: z.enum(["new", "in_progress", "done", "refused"], "Statut invalide."),
  internalNotes: z.string().trim().max(4000, "Notes internes : 4 000 caractères au maximum."),
});

export async function updateDemoRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = schema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    internalNotes: formData.get("internalNotes") ?? "",
  });
  if (!parsed.success) return invalid(parsed.error);

  const { error } = await supabase
    .from("demo_requests")
    .update({ status: parsed.data.status, internal_notes: parsed.data.internalNotes || null })
    .eq("id", parsed.data.id);
  if (error) return dbError("mise à jour de la demande de démo", error);
  revalidatePath("/admin/demandes");
  return { status: "success", message: "Demande mise à jour." };
}
