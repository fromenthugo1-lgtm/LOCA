"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { cacheTags } from "@/lib/cache/tags";
import { faqDefaults } from "@/features/faq/defaults";
import { adminDb } from "../client";
import { dbError, invalid, type ActionState } from "../action-state";

const itemSchema = z.object({
  question: z.string().trim().min(3, "Question : 3 caractères au minimum.").max(300, "Question : 300 caractères au maximum."),
  answer: z.string().trim().min(3, "Réponse : 3 caractères au minimum.").max(4000, "Réponse : 4 000 caractères au maximum."),
  displayOrder: z.coerce.number().int().min(0).max(1000),
  isPublished: z.boolean(),
});

const read = (fd: FormData) => ({
  question: fd.get("question"),
  answer: fd.get("answer"),
  displayOrder: fd.get("displayOrder") || 0,
  isPublished: fd.get("isPublished") === "on",
});

function refresh() {
  updateTag(cacheTags.faq);
  revalidatePath("/admin/faq");
}

export async function createFaqItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = itemSchema.safeParse(read(formData));
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;
  const { error } = await supabase
    .from("faq_items")
    .insert({ question: d.question, answer: d.answer, display_order: d.displayOrder, is_published: d.isPublished });
  if (error) return dbError("ajout d'une question", error);
  refresh();
  return { status: "success", message: "Question ajoutée." };
}

export async function updateFaqItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const id = z.uuid().safeParse(formData.get("id"));
  const parsed = itemSchema.safeParse(read(formData));
  if (!id.success) return { status: "error", message: "Question inconnue." };
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;
  const { error } = await supabase
    .from("faq_items")
    .update({ question: d.question, answer: d.answer, display_order: d.displayOrder, is_published: d.isPublished })
    .eq("id", id.data);
  if (error) return dbError("mise à jour d'une question", error);
  refresh();
  return { status: "success", message: "Question enregistrée." };
}

export async function deleteFaqItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "Question inconnue." };
  const { error } = await supabase.from("faq_items").delete().eq("id", id.data);
  if (error) return dbError("suppression d'une question", error);
  refresh();
  return { status: "success", message: "Question supprimée." };
}

/** Copie les questions par défaut en base (publiées) pour pouvoir les modifier. */
export async function importDefaultFaq(): Promise<ActionState> {
  const { supabase } = await adminDb();
  const { count, error: countError } = await supabase.from("faq_items").select("id", { count: "exact", head: true });
  if (countError) return dbError("lecture de la FAQ", countError);
  if ((count ?? 0) > 0) return { status: "error", message: "La FAQ contient déjà des questions : import annulé pour éviter les doublons." };
  const { error } = await supabase
    .from("faq_items")
    .insert(faqDefaults.map((f, i) => ({ question: f.question, answer: f.answer, display_order: (i + 1) * 10, is_published: true })));
  if (error) return dbError("import de la FAQ", error);
  refresh();
  return { status: "success", message: "Questions par défaut importées et publiées." };
}
