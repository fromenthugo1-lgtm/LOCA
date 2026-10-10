import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { guestOnlyPaths, protectedPrefixes, routes } from "@/config/routes";

/**
 * Exécuté avant chaque requête de page :
 * 1. rafraîchit la session Supabase et réécrit ses cookies ;
 * 2. renvoie vers la connexion un visiteur non connecté qui demande une page privée.
 * Ce contrôle est « optimiste » : chaque page et chaque action revérifient l'accès
 * (statut du compte, rôle) côté serveur.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  let response = NextResponse.next({ request });

  if (!url || !key) {
    // Supabase non configuré : les pages privées affichent elles-mêmes « à configurer ».
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // getClaims vérifie la signature du jeton (contrairement à getSession).
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);

  if (isProtected && !isSignedIn) {
    const target = request.nextUrl.clone();
    target.pathname = routes.signIn;
    target.search = "";
    target.searchParams.set("suite", pathname);
    return redirectKeepingCookies(target, response);
  }

  // Administration : rôle vérifié en base avant tout rendu. Un non-admin reçoit une vraie
  // page 404, sans indice sur l'existence de l'espace. Les pages et actions revérifient.
  const isAdminPath = pathname === routes.admin || pathname.startsWith(`${routes.admin}/`);
  if (isAdminPath && isSignedIn) {
    const { data: isAdmin, error } = await supabase.rpc("current_user_is_super_admin");
    if (error || isAdmin !== true) {
      const notFoundUrl = request.nextUrl.clone();
      notFoundUrl.pathname = "/page-introuvable";
      notFoundUrl.search = "";
      const rewrite = NextResponse.rewrite(notFoundUrl, { status: 404 });
      response.cookies.getAll().forEach((cookie) => rewrite.cookies.set(cookie));
      rewrite.headers.set("Cache-Control", "private, no-store");
      return rewrite;
    }
  }

  if (isSignedIn && guestOnlyPaths.some((p) => pathname === p)) {
    const target = request.nextUrl.clone();
    target.pathname = routes.account;
    target.search = "";
    return redirectKeepingCookies(target, response);
  }

  if (isProtected) {
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}

/** Une redirection garde les cookies de session éventuellement rafraîchis. */
function redirectKeepingCookies(target: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(target);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  redirect.headers.set("Cache-Control", "private, no-store");
  return redirect;
}

export const config = {
  matcher: [
    // Toutes les pages sauf fichiers statiques, images et métadonnées.
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)",
  ],
};
