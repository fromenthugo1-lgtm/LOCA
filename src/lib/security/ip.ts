import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";

/** Adresse IP du visiteur telle que transmise par l'hébergeur (Vercel renseigne x-forwarded-for). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || "unknown";
}

/** Empreinte non réversible (HMAC-SHA256) : l'adresse IP n'est jamais stockée en clair. */
export function hashIdentifier(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value.trim().toLowerCase()).digest("hex");
}
