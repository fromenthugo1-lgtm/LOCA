import "server-only";
import { z } from "zod";

const serverSchema = z.object({
  supabaseSecretKey: z.string().min(20),
  ipHashSecret: z.string().min(32),
});

export type ServerSecrets = z.infer<typeof serverSchema>;

/** Secrets réservés au serveur. `null` si la configuration est incomplète. */
export function getServerSecrets(): ServerSecrets | null {
  const parsed = serverSchema.safeParse({
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
    ipHashSecret: process.env.IP_HASH_SECRET,
  });
  return parsed.success ? parsed.data : null;
}
