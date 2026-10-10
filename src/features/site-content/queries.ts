import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/lib/cache/tags";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { siteContentDefaults } from "./defaults";
import { siteContentSchemas, type SiteContent, type SiteContentKey } from "./schemas";

type PublishedMap = Partial<Record<string, unknown>>;

/** Toutes les sections publiées, lues sans session et mises en cache jusqu'à la prochaine publication. */
async function getPublishedSiteContent(): Promise<PublishedMap> {
  "use cache";
  cacheTag(cacheTags.siteContent);
  cacheLife("hours");

  const supabase = createSupabasePublicClient();
  if (!supabase) return {};

  const { data, error } = await supabase.from("site_content").select("key, published");
  if (error) {
    console.error("[site-content] lecture impossible, textes par défaut affichés", { code: error.code });
    cacheLife("minutes");
    return {};
  }
  return Object.fromEntries(data.map((row) => [row.key, row.published]));
}

/**
 * Textes d'une section : version publiée si elle est valide, sinon texte par défaut du code.
 * Une version publiée invalide (schéma modifié depuis) est signalée dans les journaux.
 */
export async function getSiteContent<K extends SiteContentKey>(key: K): Promise<SiteContent<K>> {
  const published = (await getPublishedSiteContent())[key];
  if (published === undefined || published === null) return siteContentDefaults[key];

  const parsed = siteContentSchemas[key].safeParse(published);
  if (!parsed.success) {
    console.error("[site-content] version publiée invalide, texte par défaut affiché", { key });
    return siteContentDefaults[key];
  }
  return parsed.data as SiteContent<K>;
}
