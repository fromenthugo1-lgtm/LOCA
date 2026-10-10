import { z } from "zod";

/**
 * Variables d'environnement lues et validées en un seul endroit.
 * Aucune valeur par défaut ne masque une configuration manquante : les fonctions
 * renvoient `null` et l'interface affiche un message « à configurer ».
 */

const publicSchema = z.object({
  supabaseUrl: z.url(),
  supabasePublishableKey: z.string().min(20),
});

export type PublicSupabaseConfig = z.infer<typeof publicSchema>;

export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  const parsed = publicSchema.safeParse({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  return parsed.success ? parsed.data : null;
}

export function isSupabaseConfigured(): boolean {
  return getPublicSupabaseConfig() !== null;
}

/** Adresse publique du site, utilisée pour les liens absolus (SEO, e-mails, redirections). */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  const parsed = z.url().safeParse(raw);
  if (parsed.success) return parsed.data.replace(/\/$/, "");
  // En local seulement : http://localhost:3000. En production, l'absence est signalée au build.
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL manquante en production.");
  }
  return "http://localhost:3000";
}
