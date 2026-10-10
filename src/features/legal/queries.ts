import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { legalDefaults, type LegalPage, type LegalSlug } from "./defaults";

type Published = { pages: Partial<Record<LegalSlug, LegalPage>>; readable: boolean };

async function getPublishedLegalPages(): Promise<Published> {
  "use cache";
  cacheTag(cacheTags.legal);
  cacheLife("hours");

  const supabase = createSupabasePublicClient();
  if (!supabase) return { pages: {}, readable: true };
  const { data, error } = await supabase.from("legal_pages").select("slug, title, body, version, published_at");
  if (error) {
    console.error("[legal] lecture impossible, trames par défaut affichées", { code: error.code });
    cacheLife("minutes");
    return { pages: {}, readable: false };
  }
  const pages = Object.fromEntries(
    data.map((p) => [
      p.slug,
      { slug: p.slug as LegalSlug, title: p.title, body: p.body, version: p.version, publishedAt: p.published_at },
    ]),
  );
  return { pages, readable: true };
}

/** Page juridique publiée, ou trame par défaut (avec ses champs [À COMPLÉTER]). */
export async function getLegalPage(slug: LegalSlug): Promise<LegalPage> {
  const published = (await getPublishedLegalPages()).pages[slug];
  return published ?? { slug, ...legalDefaults[slug], publishedAt: null };
}

/**
 * Version des CGU en vigueur : c'est elle que l'utilisateur accepte. Renvoie null si la base
 * est momentanément illisible, pour ne jamais enregistrer une version qui ne serait pas la bonne.
 */
export async function getCurrentTermsVersion(): Promise<string | null> {
  const { pages, readable } = await getPublishedLegalPages();
  if (!readable) return null;
  return pages.cgu?.version ?? legalDefaults.cgu.version;
}
