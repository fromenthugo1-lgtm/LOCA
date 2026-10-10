import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { cacheTags } from "@/lib/cache/tags";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { PublicPlan } from "./schema";

const featuresSchema = z.array(z.string());

/** Formules publiées, dans l'ordre d'affichage. Liste vide => bloc « sur devis ». */
export async function getPublishedPlans(): Promise<PublicPlan[]> {
  "use cache";
  cacheTag(cacheTags.plans);
  cacheLife("hours");

  const supabase = createSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("plans")
    .select(
      "id, slug, name, description, setup_fee_cents, monthly_price_cents, max_users, max_requests_per_month, ai_usage_limit, ai_usage_unit, features, display_order",
    )
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[plans] lecture impossible", { code: error.code });
    cacheLife("minutes");
    return [];
  }
  return data.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    setupFeeCents: p.setup_fee_cents,
    monthlyPriceCents: p.monthly_price_cents,
    maxUsers: p.max_users,
    maxRequestsPerMonth: p.max_requests_per_month,
    aiUsageLimit: p.ai_usage_limit,
    aiUsageUnit: p.ai_usage_unit,
    features: featuresSchema.catch([]).parse(p.features),
  }));
}
