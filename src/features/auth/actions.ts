"use server";

import { redirect } from "next/navigation";
import { routes, safeInternalPath } from "@/config/routes";
import { getSiteUrl } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentTermsVersion } from "@/features/legal/queries";
import { authLimits, checkLimits } from "./rate-limit";
import {
  forgotPasswordSchema,
  formObject,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  toFieldErrors,
  type FieldErrors,
} from "./schema";

export type AuthFormState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: FieldErrors }
  | { status: "error"; message: string }
  | { status: "done"; message: string };

const msg = {
  notConfigured:
    "La connexion n'est pas encore activée sur ce site (configuration Supabase manquante). Aucune donnée n'a été envoyée.",
  limited: "Trop de tentatives. Patientez quelques minutes avant de réessayer.",
  technical: "Une erreur technique est survenue. Merci de réessayer dans quelques minutes.",
  badCredentials: "E-mail ou mot de passe incorrect.",
  notConfirmed:
    "Votre adresse e-mail n'est pas encore confirmée. Ouvrez le lien reçu par e-mail lors de l'inscription.",
  resetSent:
    "Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d'être envoyé. Pensez à vérifier vos courriers indésirables.",
  weakPassword: "Ce mot de passe est trop courant ou trop faible. Choisissez-en un autre.",
};

function limitedOrUnavailable(result: "limited" | "unavailable"): AuthFormState {
  return { status: "error", message: result === "limited" ? msg.limited : msg.notConfigured };
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse(formObject(formData, ["email", "password"]));
  if (!parsed.success) return { status: "invalid", fieldErrors: toFieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: msg.notConfigured };

  const limit = await checkLimits([
    { limit: authLimits.signInByIp, key: "ip" },
    { limit: authLimits.signInByEmail, key: { email: parsed.data.email } },
  ]);
  if (limit !== "allowed") return limitedOrUnavailable(limit);

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Message identique que le compte existe ou non : aucune information n'est révélée.
    if (error.code === "email_not_confirmed") return { status: "error", message: msg.notConfirmed };
    if (error.code === "invalid_credentials") return { status: "error", message: msg.badCredentials };
    if (error.status === 429) return { status: "error", message: msg.limited };
    console.error("[auth] connexion impossible", { code: error.code });
    return { status: "error", message: msg.technical };
  }
  redirect(safeInternalPath(String(formData.get("suite") ?? ""), routes.account));
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse(formObject(formData, ["email", "password", "passwordConfirm", "acceptTerms"]));
  if (!parsed.success) return { status: "invalid", fieldErrors: toFieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: msg.notConfigured };

  const limit = await checkLimits([{ limit: authLimits.signUpByIp, key: "ip" }]);
  if (limit !== "allowed") return limitedOrUnavailable(limit);

  // La version des CGU acceptée est celle en vigueur, lue côté serveur (jamais envoyée par le navigateur).
  const termsVersion = await getCurrentTermsVersion();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getSiteUrl()}${routes.account}`,
      data: { terms_version: termsVersion },
    },
  });
  if (error) {
    if (error.code === "weak_password") return { status: "invalid", fieldErrors: { password: msg.weakPassword } };
    if (error.status === 429 || error.code === "over_email_send_rate_limit") return { status: "error", message: msg.limited };
    // Une adresse déjà inscrite n'est pas signalée (Supabase renvoie un succès factice).
    console.error("[auth] inscription impossible", { code: error.code });
    return { status: "error", message: msg.technical };
  }
  redirect(routes.checkEmail);
}

export async function requestPasswordReset(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse(formObject(formData, ["email"]));
  if (!parsed.success) return { status: "invalid", fieldErrors: toFieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: msg.notConfigured };

  const limit = await checkLimits([
    { limit: authLimits.resetByIp, key: "ip" },
    { limit: authLimits.resetByEmail, key: { email: parsed.data.email } },
  ]);
  if (limit === "unavailable") return limitedOrUnavailable(limit);
  // Limite atteinte : même réponse qu'en cas de succès, pour ne rien révéler.
  if (limit === "limited") return { status: "done", message: msg.resetSent };

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}${routes.resetPassword}`,
  });
  if (error && error.status !== 429) console.error("[auth] réinitialisation impossible", { code: error.code });
  return { status: "done", message: msg.resetSent };
}

export async function updatePassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse(formObject(formData, ["password", "passwordConfirm"]));
  if (!parsed.success) return { status: "invalid", fieldErrors: toFieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: msg.notConfigured };

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) {
    return { status: "error", message: "Ce lien a expiré ou a déjà servi. Demandez un nouvel e-mail de réinitialisation." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "weak_password") return { status: "invalid", fieldErrors: { password: msg.weakPassword } };
    if (error.code === "same_password") {
      return { status: "invalid", fieldErrors: { password: "Choisissez un mot de passe différent de l'ancien." } };
    }
    console.error("[auth] changement de mot de passe impossible", { code: error.code });
    return { status: "error", message: msg.technical };
  }
  redirect(`${routes.account}?motdepasse=modifie`);
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect(routes.home);
}

/** Acceptation de la version des CGU en vigueur (relue côté serveur). */
export async function acceptCurrentTerms(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(routes.signIn);
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect(routes.signIn);

  const { error } = await supabase.rpc("accept_terms", { p_version: await getCurrentTermsVersion() });
  if (error) {
    console.error("[auth] acceptation des CGU impossible", { code: error.code });
    redirect(`${routes.account}?erreur=cgu`);
  }
  redirect(routes.account);
}

/** Demande de suppression du compte : ouvre une demande RGPD, sans suppression immédiate. */
export async function requestAccountDeletion(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(routes.signIn);
  const { error } = await supabase.rpc("request_account_deletion");
  if (error) {
    console.error("[auth] demande de suppression impossible", { code: error.code });
    redirect(`${routes.account}?erreur=suppression`);
  }
  redirect(`${routes.account}?suppression=demandee`);
}
