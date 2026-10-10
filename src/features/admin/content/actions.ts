"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { cacheTags } from "@/lib/cache/tags";
import type { Json } from "@/lib/supabase/database.types";
import { siteContentDefaults } from "@/features/site-content/defaults";
import { fromFormData, type ContentValue } from "@/features/site-content/form-data";
import { isSiteContentKey, siteContentSchemas } from "@/features/site-content/schemas";
import { adminDb } from "../client";
import { dbError, invalid, type ActionState } from "../action-state";

/**
 * Enregistre une section de texte. « Publier » met le texte en ligne immédiatement (sans
 * redéploiement) ; « Brouillon » le garde de côté sans toucher au site.
 */
export async function saveContent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const key = String(formData.get("key") ?? "");
  if (!isSiteContentKey(key)) return { status: "error", message: "Section inconnue." };

  const value = fromFormData(siteContentDefaults[key] as unknown as ContentValue, formData);
  const parsed = siteContentSchemas[key].safeParse(value);
  if (!parsed.success) return invalid(parsed.error);

  const json = parsed.data as unknown as Json;
  const publish = formData.get("intent") !== "draft";
  const { error } = publish
    ? await supabase
        .from("site_content")
        .upsert({ key, published: json, published_at: new Date().toISOString(), draft: null })
    : await supabase.from("site_content").upsert({ key, draft: json });
  if (error) return dbError("enregistrement d'un contenu", error);

  if (publish) updateTag(cacheTags.siteContent);
  revalidatePath(`/admin/contenus/${key}`);
  return {
    status: "success",
    message: publish ? "Texte publié : il est en ligne sur le site." : "Brouillon enregistré. Le site n'a pas changé.",
  };
}

/** Supprime la version enregistrée : le site affiche de nouveau le texte par défaut. */
export async function resetContent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const key = String(formData.get("key") ?? "");
  if (!isSiteContentKey(key)) return { status: "error", message: "Section inconnue." };
  const { error } = await supabase.from("site_content").delete().eq("key", key);
  if (error) return dbError("retour au texte par défaut", error);
  updateTag(cacheTags.siteContent);
  // Le bloc de ce formulaire disparaît avec la version supprimée : la confirmation est portée par l'URL.
  redirect(`/admin/contenus/${key}?retour=defaut`);
}
