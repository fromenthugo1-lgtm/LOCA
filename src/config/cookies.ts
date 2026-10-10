/**
 * Finalités de cookies. En V1, seuls des cookies strictement nécessaires sont utilisés :
 * aucune catégorie optionnelle n'a d'outil actif, donc aucun bandeau n'est affiché
 * (aucun consentement à recueillir). Ajouter un outil = renseigner `tools` ici ; le bandeau
 * apparaît alors automatiquement et l'outil ne doit se charger qu'après consentement
 * (composant `ConsentGate`). Voir docs/DECISIONS.md, D-008.
 */
export type CookieCategoryId = "necessary" | "analytics";

export type CookieCategory = {
  id: CookieCategoryId;
  label: string;
  description: string;
  required: boolean;
  tools: { name: string; purpose: string; duration: string }[];
};

export const cookieCategories: CookieCategory[] = [
  {
    id: "necessary",
    label: "Strictement nécessaires",
    description: "Indispensables au fonctionnement du site. Ils ne demandent pas votre consentement.",
    required: true,
    tools: [
      { name: "Session de connexion (sb-…)", purpose: "Vous garder connecté à votre espace", duration: "Durée de la session" },
      { name: "Choix cookies (se_consent)", purpose: "Mémoriser vos choix ci-dessous", duration: "6 mois" },
    ],
  },
  {
    id: "analytics",
    label: "Mesure d'audience",
    description: "Comprendre comment le site est utilisé, pour l'améliorer. Aucun outil n'est installé à ce jour.",
    required: false,
    tools: [],
  },
];

export const CONSENT_COOKIE = "se_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 182;

export function optionalCategoriesWithTools(): CookieCategory[] {
  return cookieCategories.filter((c) => !c.required && c.tools.length > 0);
}
