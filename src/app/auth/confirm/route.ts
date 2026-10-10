import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { routes, safeInternalPath } from "@/config/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedTypes: EmailOtpType[] = ["email", "signup", "recovery", "email_change", "invite"];

/**
 * Lien reçu par e-mail (confirmation d'adresse, réinitialisation, changement d'adresse).
 * Le jeton est vérifié côté serveur ; en cas de succès la session est ouverte.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeInternalPath(searchParams.get("next"), routes.account);

  const failure = new URL(routes.signIn, request.url);
  failure.searchParams.set("lien", "invalide");

  if (!tokenHash || !type || !allowedTypes.includes(type)) return NextResponse.redirect(failure);

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(failure);

  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return NextResponse.redirect(failure);

  return NextResponse.redirect(new URL(next, request.url));
}
