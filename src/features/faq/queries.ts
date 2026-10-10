import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { faqDefaults, type FaqEntry } from "./defaults";

/** FAQ publiée en base, ou questions par défaut si aucune n'est publiée. */
export async function getPublishedFaq(): Promise<FaqEntry[]> {
  "use cache";
  cacheTag(cacheTags.faq);
  cacheLife("hours");

  const supabase = createSupabasePublicClient();
  if (!supabase) return faqDefaults;

  const { data, error } = await supabase
    .from("faq_items")
    .select("question, answer, display_order")
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[faq] lecture impossible, questions par défaut affichées", { code: error.code });
    cacheLife("minutes");
    return faqDefaults;
  }
  return data.length > 0 ? data.map(({ question, answer }) => ({ question, answer })) : faqDefaults;
}
