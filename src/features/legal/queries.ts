import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { legalDefaults, type LegalPage, type LegalSlug } from "./defaults";

async function getPublishedLegalPages(): Promise<Partial<Record<LegalSlug, LegalPage>>> {
  "use cache";
  cacheTag(cacheTags.legal);
  cacheLife("hours");

  const supabase = createSupabasePublicClient();
  if (!supabase) return {};
  const { data, error } = await supabase.from("legal_pages").select("slug, title, body, version, published_at");
  if (error) {
    console.error("[legal] lecture impossible, trames par défaut affichées", { code: error.code });
    cacheLife("minutes");
    return {};
  }
  return Object.fromEntries(
    data.map((p) => [
      p.slug,
      { slug: p.slug as LegalSlug, title: p.title, body: p.body, version: p.version, publishedAt: p.published_at },
    ]),
  );
}

/** Page juridique publiée, ou trame par défaut (avec ses champs [À COMPLÉTER]). */
export async function getLegalPage(slug: LegalSlug): Promise<LegalPage> {
  const published = (await getPublishedLegalPages())[slug];
  return published ?? { slug, ...legalDefaults[slug], publishedAt: null };
}

/** Version des CGU en vigueur : c'est elle que l'utilisateur accepte à l'inscription. */
export async function getCurrentTermsVersion(): Promise<string> {
  return (await getLegalPage("cgu")).version;
}
