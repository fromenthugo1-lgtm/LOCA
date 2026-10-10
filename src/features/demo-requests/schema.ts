import { z } from "zod";
import { companySizeOptions, sectorOptions } from "@/config/business";

const sectorValues = sectorOptions.map((o) => o.value) as [string, ...string[]];
const sizeValues = companySizeOptions.map((o) => o.value) as [string, ...string[]];

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((v) => (v === "" ? null : v));

/** Schéma partagé navigateur / serveur du formulaire de demande de démonstration. */
export const demoRequestSchema = z.object({
  fullName: z.string().trim().min(2, "Indiquez votre nom et votre prénom.").max(120, "120 caractères au maximum."),
  email: z.string().trim().toLowerCase().max(254, "Adresse trop longue.").pipe(z.email("Indiquez une adresse e-mail valide.")),
  companyName: z.string().trim().min(1, "Indiquez le nom de votre entreprise.").max(160, "160 caractères au maximum."),
  jobTitle: z.string().trim().min(1, "Indiquez votre fonction.").max(120, "120 caractères au maximum."),
  sector: z.enum(sectorValues, "Choisissez un secteur."),
  companySize: z
    .union([z.enum(sizeValues), z.literal("")])
    .transform((v) => (v === "" ? null : v)),
  phone: optionalText(30, "Numéro trop long.").refine(
    (v) => v === null || /^\+?[0-9 .()-]{6,30}$/.test(v),
    "Indiquez un numéro de téléphone valide.",
  ),
  message: optionalText(2000, "2 000 caractères au maximum."),
});

export type DemoRequestInput = z.input<typeof demoRequestSchema>;
export type DemoRequest = z.output<typeof demoRequestSchema>;
export type DemoRequestField = keyof DemoRequestInput;

export const demoFormFields: DemoRequestField[] = [
  "fullName",
  "email",
  "companyName",
  "jobTitle",
  "sector",
  "companySize",
  "phone",
  "message",
];

/** Délai minimal de remplissage : un humain ne remplit pas ce formulaire en moins de 3 secondes. */
export const MIN_FILL_TIME_MS = 3000;

export type SpamCheck = { ok: true } | { ok: false; reason: "honeypot" | "too_fast" };

/** Contrôles anti-robot : champ piège invisible rempli, ou envoi trop rapide. */
export function checkAntiSpam(input: { honeypot: string; elapsedMs: number }): SpamCheck {
  if (input.honeypot.trim() !== "") return { ok: false, reason: "honeypot" };
  if (!Number.isFinite(input.elapsedMs) || input.elapsedMs < MIN_FILL_TIME_MS) return { ok: false, reason: "too_fast" };
  return { ok: true };
}

export function readDemoForm(formData: FormData): DemoRequestInput {
  const get = (k: string) => String(formData.get(k) ?? "");
  return {
    fullName: get("fullName"),
    email: get("email"),
    companyName: get("companyName"),
    jobTitle: get("jobTitle"),
    sector: get("sector"),
    companySize: get("companySize"),
    phone: get("phone"),
    message: get("message"),
  };
}

export function fieldErrorsFrom(error: z.ZodError): Partial<Record<DemoRequestField, string>> {
  const out: Partial<Record<DemoRequestField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as DemoRequestField | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
