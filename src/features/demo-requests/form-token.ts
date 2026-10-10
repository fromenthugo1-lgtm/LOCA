import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Jeton de formulaire : horodatage signé par le serveur au chargement du formulaire.
 * Le délai de remplissage est calculé par le serveur, pas déclaré par le navigateur.
 */
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

function sign(issuedAt: number, secret: string): string {
  return createHmac("sha256", secret).update(`demo-form:${issuedAt}`).digest("hex");
}

export function issueFormToken(secret: string, now = Date.now()): string {
  return `${now}.${sign(now, secret)}`;
}

/** Durée écoulée depuis l'émission du jeton, ou null si le jeton est absent, faux ou expiré. */
export function elapsedSinceToken(token: string, secret: string, now = Date.now()): number | null {
  const [raw, signature] = token.split(".");
  const issuedAt = Number(raw);
  if (!Number.isSafeInteger(issuedAt) || !signature) return null;
  const expected = Buffer.from(sign(issuedAt, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const elapsed = now - issuedAt;
  return elapsed >= 0 && elapsed <= MAX_AGE_MS ? elapsed : null;
}
