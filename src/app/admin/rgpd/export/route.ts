import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Export JSON des données d'une personne (droit d'accès, portabilité). Réservé au
 * super_admin : la fonction en base vérifie le rôle et journalise l'export.
 */
export async function GET(request: NextRequest) {
  const email = z.string().trim().toLowerCase().pipe(z.email()).safeParse(request.nextUrl.searchParams.get("email"));
  if (!email.success) return new NextResponse("Adresse e-mail invalide.", { status: 400 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return new NextResponse("Introuvable.", { status: 404 });
  const { data, error } = await supabase.rpc("admin_export_personal_data", { p_email: email.data });
  if (error) {
    // Refus d'accès comme absence : rien n'est révélé à un non-admin.
    return new NextResponse("Introuvable.", { status: 404, headers: { "Cache-Control": "private, no-store" } });
  }

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="donnees-personnelles-${date}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
