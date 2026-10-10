"use server";

import { getServerSecrets } from "@/lib/env.server";
import { getClientIp, hashIdentifier } from "@/lib/security/ip";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkAntiSpam, demoRequestSchema, fieldErrorsFrom, readDemoForm, type DemoRequestField } from "./schema";

export type DemoFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "invalid"; fieldErrors: Partial<Record<DemoRequestField, string>> }
  | { status: "error"; message: string };

const messages = {
  unavailable:
    "L'enregistrement des demandes n'est pas encore activé sur ce site. Votre demande n'a pas été envoyée. Merci de réessayer plus tard.",
  rateLimited: "Plusieurs demandes ont déjà été envoyées depuis votre connexion. Merci de réessayer dans une heure.",
  spam: "Votre demande n'a pas pu être envoyée. Vérifiez le formulaire puis réessayez.",
  failed: "Votre demande n'a pas pu être enregistrée à cause d'une erreur technique. Merci de réessayer dans quelques minutes.",
};

/**
 * Enregistre une demande de démonstration. Le message de succès n'est renvoyé que si la base
 * a confirmé l'insertion. Aucun e-mail de confirmation n'est annoncé (aucun service configuré).
 */
export async function submitDemoRequest(_prev: DemoFormState, formData: FormData): Promise<DemoFormState> {
  const spam = checkAntiSpam({
    honeypot: String(formData.get("website") ?? ""),
    elapsedMs: Number(formData.get("elapsedMs") ?? 0),
  });
  if (!spam.ok) return { status: "error", message: messages.spam };

  const parsed = demoRequestSchema.safeParse(readDemoForm(formData));
  if (!parsed.success) return { status: "invalid", fieldErrors: fieldErrorsFrom(parsed.error) };

  const supabase = createSupabaseAdminClient();
  const secrets = getServerSecrets();
  if (!supabase || !secrets) return { status: "error", message: messages.unavailable };

  const ipHash = hashIdentifier(await getClientIp(), secrets.ipHashSecret);
  const d = parsed.data;
  const { error } = await supabase.rpc("submit_demo_request", {
    p_full_name: d.fullName,
    p_email: d.email,
    p_company_name: d.companyName,
    p_job_title: d.jobTitle,
    p_sector: d.sector,
    p_company_size: d.companySize ?? "",
    p_phone: d.phone ?? "",
    p_message: d.message ?? "",
    p_ip_hash: ipHash,
  });

  if (error) {
    if (error.message.includes("rate_limited")) return { status: "error", message: messages.rateLimited };
    // Journal sans donnée personnelle : seulement le code d'erreur.
    console.error("[demo] échec d'enregistrement", { code: error.code });
    return { status: "error", message: messages.failed };
  }
  return { status: "success" };
}
