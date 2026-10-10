import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";

/**
 * Adresse IP du visiteur. Sur Vercel, `x-vercel-forwarded-for` et `x-real-ip` sont posés par
 * la plateforme et ne peuvent pas être falsifiés par le visiteur. Derrière un autre hébergeur,
 * vérifier quel en-tête est fiable avant la mise en ligne (docs/DECISIONS.md, D-014).
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const trusted = h.get("x-vercel-forwarded-for") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for");
  return trusted?.split(",")[0]?.trim() || "unknown";
}

/** Empreinte non réversible (HMAC-SHA256) : l'adresse IP n'est jamais stockée en clair. */
export function hashIdentifier(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value.trim().toLowerCase()).digest("hex");
}
