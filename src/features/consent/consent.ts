import { z } from "zod";
import { CONSENT_VERSION, type CookieCategoryId } from "@/config/cookies";

const consentSchema = z.object({
  v: z.number().int(),
  at: z.string(),
  choices: z.record(z.string(), z.boolean()),
});

export type ConsentState = z.infer<typeof consentSchema>;

/** Lit la valeur du cookie de consentement. Une version périmée vaut absence de choix. */
export function parseConsent(raw: string | undefined | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = consentSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    if (!parsed.success || parsed.data.v !== CONSENT_VERSION) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function serializeConsent(choices: Partial<Record<CookieCategoryId, boolean>>, now = new Date()): string {
  const state: ConsentState = { v: CONSENT_VERSION, at: now.toISOString(), choices: { ...choices, necessary: true } };
  return encodeURIComponent(JSON.stringify(state));
}

/** Sans choix explicite, une finalité optionnelle est refusée (aucun traceur avant consentement). */
export function isAllowed(state: ConsentState | null, category: CookieCategoryId): boolean {
  if (category === "necessary") return true;
  return state?.choices[category] === true;
}
