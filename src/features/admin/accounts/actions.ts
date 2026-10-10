"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { business } from "@/config/business";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminDb } from "../client";
import { dbError, invalid, type ActionState } from "../action-state";

const statusSchema = z.object({
  userId: z.uuid(),
  status: z.enum(["created", "onboarding_pending", "active", "suspended"], "Statut invalide."),
  reason: z.string().trim().max(300, "Motif : 300 caractères au maximum."),
});

export async function setAccountStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { error } = await supabase.rpc("admin_set_account_status", {
    p_user_id: parsed.data.userId,
    p_status: parsed.data.status,
    p_reason: parsed.data.reason || undefined,
  });
  if (error) {
    if (error.message.includes("cannot_change_own_status")) return { status: "error", message: "Vous ne pouvez pas modifier votre propre statut." };
    return dbError("changement de statut", error);
  }
  revalidatePath(`/admin/comptes/${parsed.data.userId}`);
  return { status: "success", message: "Statut mis à jour. L'utilisateur voit le nouvel état à son prochain chargement de page." };
}

const idSchema = z.object({ userId: z.uuid() });

export async function scheduleDeletion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { error } = await supabase.rpc("admin_schedule_account_deletion", {
    p_user_id: parsed.data.userId,
    p_grace_days: business.accountDeletionGraceDays,
  });
  if (error) {
    if (error.message.includes("cannot_delete_self")) return { status: "error", message: "Vous ne pouvez pas supprimer votre propre compte ici." };
    return dbError("programmation de la suppression", error);
  }
  revalidatePath(`/admin/comptes/${parsed.data.userId}`);
  return { status: "success", message: `Compte suspendu. Anonymisation possible dans ${business.accountDeletionGraceDays} jours.` };
}

export async function cancelDeletion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { error } = await supabase.rpc("admin_cancel_account_deletion", { p_user_id: parsed.data.userId });
  if (error) return dbError("annulation de la suppression", error);
  revalidatePath(`/admin/comptes/${parsed.data.userId}`);
  return { status: "success", message: "Suppression annulée. Le compte reste suspendu : réactivez-le si besoin." };
}

/**
 * Après le délai de grâce : anonymisation en base (fonction contrôlée), puis suppression
 * « douce » du compte d'authentification (l'adresse e-mail n'est plus utilisable).
 */
export async function anonymizeAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const parsed = z.object({ userId: z.uuid(), confirm: z.literal("ANONYMISER", "Tapez ANONYMISER pour confirmer.") }).safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return invalid(parsed.error);

  const { error } = await supabase.rpc("admin_anonymize_account", { p_user_id: parsed.data.userId });
  if (error) {
    if (error.message.includes("grace_period_not_over")) return { status: "error", message: "Le délai de grâce n'est pas terminé." };
    if (error.message.includes("deletion_not_scheduled")) return { status: "error", message: "Aucune suppression n'est programmée pour ce compte." };
    return dbError("anonymisation", error);
  }

  const service = createSupabaseAdminClient();
  if (!service) {
    return { status: "error", message: "Profil anonymisé, mais la clé secrète manque pour supprimer le compte de connexion. À terminer après configuration." };
  }
  const { error: authError } = await service.auth.admin.deleteUser(parsed.data.userId, true);
  if (authError) {
    console.error("[admin] suppression du compte de connexion impossible", { code: authError.code });
    return { status: "error", message: "Profil anonymisé, mais la suppression du compte de connexion a échoué. Réessayez." };
  }
  revalidatePath("/admin/comptes");
  return { status: "success", message: "Compte anonymisé et compte de connexion supprimé." };
}
