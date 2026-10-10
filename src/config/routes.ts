/** Routes de l'application, centralisées pour éviter les liens en dur dispersés. */
export const routes = {
  home: "/",
  demo: "/demo",
  pricing: "/tarifs",
  contact: "/contact",
  legalNotice: "/mentions-legales",
  privacy: "/confidentialite",
  terms: "/cgu",
  salesTerms: "/cgv",
  signIn: "/connexion",
  signUp: "/inscription",
  forgotPassword: "/mot-de-passe-oublie",
  resetPassword: "/reinitialiser-mot-de-passe",
  checkEmail: "/verifier-email",
  account: "/espace",
  admin: "/admin",
} as const;

/** Préfixes qui exigent une session. Le contrôle fin (statut, rôle) est fait dans chaque page. */
export const protectedPrefixes = [routes.account, routes.admin] as const;

/** Pages d'authentification inutiles une fois connecté. */
export const guestOnlyPaths = [routes.signIn, routes.signUp] as const;

/**
 * Une redirection après connexion n'accepte qu'un chemin interne. Le chemin est analysé comme
 * le ferait le navigateur (qui ignore tabulations et retours à la ligne : « /\t/site.fr »
 * deviendrait « //site.fr ») : tout caractère de contrôle ou toute autre origine est refusé.
 */
export function safeInternalPath(value: string | null | undefined, fallback: string = routes.account): string {
  if (!value || !value.startsWith("/") || /[\u0000-\u001F\u007F\\]/.test(value)) return fallback;
  try {
    const base = "http://interne.invalid";
    const url = new URL(value, base);
    if (url.origin !== base || url.pathname.startsWith("//")) return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}
