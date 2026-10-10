import { z } from "zod";

/** Règles de mot de passe, identiques à la configuration Supabase (supabase/config.toml). */
export const passwordRules = [
  { id: "length", label: "12 caractères au minimum", test: (p: string) => p.length >= 12 },
  { id: "lower", label: "Une lettre minuscule", test: (p: string) => /[a-z]/.test(p) },
  { id: "upper", label: "Une lettre majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { id: "digit", label: "Un chiffre", test: (p: string) => /[0-9]/.test(p) },
] as const;

const email = z.string().trim().toLowerCase().max(254).pipe(z.email("Indiquez une adresse e-mail valide."));

const password = z
  .string()
  .max(128, "128 caractères au maximum.")
  .refine((p) => passwordRules.every((r) => r.test(p)), "Le mot de passe ne respecte pas les règles indiquées.");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Indiquez votre mot de passe.").max(128),
});

export const signUpSchema = z
  .object({
    email,
    password,
    passwordConfirm: z.string(),
    acceptTerms: z.literal("on", "Vous devez accepter les conditions d'utilisation."),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Les deux mots de passe ne sont pas identiques.",
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, passwordConfirm: z.string() })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Les deux mots de passe ne sont pas identiques.",
  });

export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function formObject(formData: FormData, keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "")]));
}
