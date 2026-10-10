"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { cacheTags } from "@/lib/cache/tags";
import { adminDb } from "../client";
import { dbError, invalid, type ActionState } from "../action-state";

const schema = z.object({
  slug: z.enum(["mentions-legales", "confidentialite", "cgu", "cgv"], "Page inconnue."),
  title: z.string().trim().min(3, "Titre : 3 caractères au minimum.").max(160),
  version: z.string().trim().regex(/^[A-Za-z0-9._-]{1,40}$/, "Version : lettres, chiffres, points, tirets (exemple : 2026-10-v1)."),
  body: z.string().trim().min(1, "Texte : obligatoire.").max(100000),
});

/**
 * Publie une page juridique. Chaque version publiée est archivée en base. Changer le texte
 * des CGU impose un nouveau numéro de version : les utilisateurs devront l'accepter.
 */
export async function publishLegalPage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const d = parsed.data;
  const { error } = await supabase
    .from("legal_pages")
    .upsert({ slug: d.slug, title: d.title, body: d.body, version: d.version, published_at: new Date().toISOString() });
  if (error) return dbError("publication d'une page juridique", error);
  updateTag(cacheTags.legal);
  revalidatePath(`/admin/juridique/${d.slug}`);
  return {
    status: "success",
    message: d.slug === "cgu" ? "Publié. Les utilisateurs devront accepter cette version à leur prochaine visite si elle a changé." : "Publié sur le site.",
  };
}
