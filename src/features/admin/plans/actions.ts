"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cacheTags } from "@/lib/cache/tags";
import { parseEurosToCents, planInputSchema, type PlanInput } from "@/features/plans/schema";
import { adminDb } from "../client";
import { dbError, invalid, type ActionState } from "../action-state";

/** Lit le formulaire de formule : montants saisis en euros, convertis en centimes. */
function readPlanForm(formData: FormData): { input?: unknown; error?: ActionState } {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const money: Record<string, number | null> = {};
  for (const [field, label] of [["setupFee", "Frais de mise en service"], ["monthlyPrice", "Abonnement mensuel"]] as const) {
    const cents = parseEurosToCents(get(field));
    if (cents === "invalid") return { error: { status: "invalid", fieldErrors: { [field]: `${label} : montant invalide (exemple : 49,90).` } } };
    money[field] = cents;
  }
  const int = (k: string) => (get(k) === "" ? null : Number(get(k)));
  return {
    input: {
      slug: get("slug"),
      name: get("name"),
      description: get("description") || null,
      setupFeeCents: money.setupFee,
      monthlyPriceCents: money.monthlyPrice,
      maxUsers: int("maxUsers"),
      maxRequestsPerMonth: int("maxRequestsPerMonth"),
      aiUsageLimit: int("aiUsageLimit"),
      aiUsageUnit: get("aiUsageUnit") || null,
      features: get("features").split("\n").map((f) => f.trim()).filter(Boolean),
      displayOrder: int("displayOrder") ?? 0,
      isPublished: formData.get("isPublished") === "on",
    },
  };
}

const toRow = (p: PlanInput) => ({
  slug: p.slug,
  name: p.name,
  description: p.description,
  setup_fee_cents: p.setupFeeCents,
  monthly_price_cents: p.monthlyPriceCents,
  max_users: p.maxUsers,
  max_requests_per_month: p.maxRequestsPerMonth,
  ai_usage_limit: p.aiUsageLimit,
  ai_usage_unit: p.aiUsageUnit,
  features: p.features,
  display_order: p.displayOrder,
  is_published: p.isPublished,
});

function refreshPublicPricing() {
  updateTag(cacheTags.plans);
  revalidatePath("/admin/formules");
}

export async function createPlan(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const read = readPlanForm(formData);
  if (read.error) return read.error;
  const parsed = planInputSchema.safeParse(read.input);
  if (!parsed.success) return invalid(parsed.error);
  const { data, error } = await supabase.from("plans").insert(toRow(parsed.data)).select("id").single();
  if (error) return dbError("création de formule", error);
  refreshPublicPricing();
  redirect(`/admin/formules/${data.id}`);
}

export async function updatePlan(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "Formule inconnue." };
  const read = readPlanForm(formData);
  if (read.error) return read.error;
  const parsed = planInputSchema.safeParse(read.input);
  if (!parsed.success) return invalid(parsed.error);
  const { error } = await supabase.from("plans").update(toRow(parsed.data)).eq("id", id.data).is("archived_at", null);
  if (error) return dbError("mise à jour de formule", error);
  refreshPublicPricing();
  return { status: "success", message: parsed.data.isPublished ? "Formule enregistrée et publiée sur le site." : "Formule enregistrée (non publiée)." };
}

/** Archivage : suppression logique. La formule disparaît du site et ne peut plus être modifiée. */
export async function archivePlan(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await adminDb();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "Formule inconnue." };
  const { error } = await supabase
    .from("plans")
    .update({ archived_at: new Date().toISOString(), is_published: false })
    .eq("id", id.data);
  if (error) return dbError("archivage de formule", error);
  refreshPublicPricing();
  redirect("/admin/formules");
}
