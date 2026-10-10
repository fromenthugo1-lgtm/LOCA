import "server-only";
import { getServerSecrets } from "@/lib/env.server";
import { getClientIp, hashIdentifier } from "@/lib/security/ip";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Limit = { action: string; max: number; windowSeconds: number };

/** Limites applicatives, en plus de celles de Supabase Auth. */
export const authLimits = {
  signInByIp: { action: "signin_ip", max: 20, windowSeconds: 15 * 60 },
  signInByEmail: { action: "signin_email", max: 8, windowSeconds: 15 * 60 },
  signUpByIp: { action: "signup_ip", max: 5, windowSeconds: 60 * 60 },
  resetByIp: { action: "reset_ip", max: 5, windowSeconds: 60 * 60 },
  resetByEmail: { action: "reset_email", max: 3, windowSeconds: 60 * 60 },
} satisfies Record<string, Limit>;

export type RateLimitResult = "allowed" | "limited" | "unavailable";

/**
 * Vérifie une ou plusieurs limites (par IP hachée, par e-mail haché). Si la configuration
 * serveur manque, renvoie "unavailable" : l'action refuse plutôt que de laisser passer sans contrôle.
 */
export async function checkLimits(checks: { limit: Limit; key: "ip" | { email: string } }[]): Promise<RateLimitResult> {
  const supabase = createSupabaseAdminClient();
  const secrets = getServerSecrets();
  if (!supabase || !secrets) return "unavailable";

  const ip = await getClientIp();
  for (const { limit, key } of checks) {
    const raw = key === "ip" ? `ip:${ip}` : `email:${key.email}`;
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_action: limit.action,
      p_key_hash: hashIdentifier(raw, secrets.ipHashSecret),
      p_max: limit.max,
      p_window_seconds: limit.windowSeconds,
    });
    if (error) {
      console.error("[rate-limit] contrôle impossible", { code: error.code });
      return "unavailable";
    }
    if (data === false) return "limited";
  }
  return "allowed";
}
