"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminDb } from "../client";
import { dbError, invalid, type ActionState } from "../action-state";

const opt = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} : ${max} caractères au maximum.`)
    .transform((v) => v || null);

const companySchema = z.object({
  name: z.string().trim().min(1, "Nom : obligatoire.").max(160, "Nom : 160 caractères au maximum."),
  legalIdentifier: opt(40, "SIREN ou SIRET"),
  sector: opt(80, "Secteur"),
  size: opt(40, "Taille"),
  notes: opt(4000, "Notes"),
});

const toRow = (d: z.infer<typeof companySchema>) => ({
  name: d.name,
  legal_identifier: d.legalIdentifier,
  sector: d.sector,
  size: d.size,
});

type Db = Awaited<ReturnType<typeof adminDb>>["supabase"];

/** Notes internes : table séparée, invisible des membres de l'entreprise. */
async function saveNotes(supabase: Db, companyId: string, notes: string | null) {
  return notes
    ? supabase.from("company_internal_notes").upsert({ company_id: companyId, notes })
    : supabase.from("company_internal_notes").delete().eq("company_id", companyId);
}

export async function createCompany(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = companySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { data, error } = await supabase.from("companies").insert(toRow(parsed.data)).select("id").single();
  if (error) return dbError("création d'entreprise", error);
  const notes = await saveNotes(supabase, data.id, parsed.data.notes);
  if (notes.error) return dbError("notes internes", notes.error);
  redirect(`/admin/entreprises/${data.id}`);
}

export async function updateCompany(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = companySchema
    .extend({ id: z.uuid(), status: z.enum(["active", "suspended", "archived"], "Statut invalide.") })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { error } = await supabase
    .from("companies")
    .update({ ...toRow(parsed.data), status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) return dbError("mise à jour d'entreprise", error);
  const notes = await saveNotes(supabase, parsed.data.id, parsed.data.notes);
  if (notes.error) return dbError("notes internes", notes.error);
  revalidatePath(`/admin/entreprises/${parsed.data.id}`);
  return { status: "success", message: "Entreprise mise à jour." };
}

const role = z.enum(["member", "company_admin"], "Rôle invalide.");

export async function addMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = z
    .object({ companyId: z.uuid(), email: z.string().trim().pipe(z.email("E-mail invalide.")), role })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { data: userId, error: findError } = await supabase.rpc("admin_find_account_by_email", { p_email: parsed.data.email });
  if (findError) return dbError("recherche de compte", findError);
  if (!userId) return { status: "error", message: "Aucun compte n'existe avec cette adresse. La personne doit d'abord s'inscrire." };

  const { error } = await supabase
    .from("company_members")
    .insert({ company_id: parsed.data.companyId, user_id: userId, role: parsed.data.role });
  if (error) {
    if (error.code === "23505") return { status: "error", message: "Ce compte est déjà rattaché à l'entreprise." };
    return dbError("ajout de membre", error);
  }
  revalidatePath(`/admin/entreprises/${parsed.data.companyId}`);
  return { status: "success", message: "Compte rattaché à l'entreprise." };
}

const memberRef = z.object({ companyId: z.uuid(), userId: z.uuid() });

export async function changeMemberRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = memberRef.extend({ role }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { error } = await supabase
    .from("company_members")
    .update({ role: parsed.data.role })
    .eq("company_id", parsed.data.companyId)
    .eq("user_id", parsed.data.userId);
  if (error) return dbError("changement de rôle", error);
  revalidatePath(`/admin/entreprises/${parsed.data.companyId}`);
  return { status: "success", message: "Rôle mis à jour." };
}

export async function removeMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = memberRef.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { error } = await supabase
    .from("company_members")
    .delete()
    .eq("company_id", parsed.data.companyId)
    .eq("user_id", parsed.data.userId);
  if (error) return dbError("retrait de membre", error);
  revalidatePath(`/admin/entreprises/${parsed.data.companyId}`);
  return { status: "success", message: "Compte retiré de l'entreprise." };
}
