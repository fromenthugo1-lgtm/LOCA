/** Constantes métier centralisées. */
export const business = {
  /** Les prix saisis dans l'administration s'entendent hors taxes (vente B2B). */
  pricesExcludeTax: true,
  currency: "EUR",
  /** Délai de grâce par défaut avant anonymisation d'un compte supprimé (jours). */
  accountDeletionGraceDays: 30,
  /** Conservation envisagée des demandes de démo (à valider, docs/rgpd/conservation.md). */
  demoRequestRetentionYears: 3,
} as const;

export const sectorOptions = [
  { value: "btp", label: "BTP et bâtiment" },
  { value: "terrassement", label: "Terrassement" },
  { value: "paysagisme", label: "Paysagisme" },
  { value: "electricite", label: "Électricité" },
  { value: "industrie", label: "PME industrielle" },
  { value: "autre", label: "Autre secteur" },
] as const;

export const companySizeOptions = [
  { value: "solo", label: "Je travaille seul" },
  { value: "2-9", label: "2 à 9 personnes" },
  { value: "10-49", label: "10 à 49 personnes" },
  { value: "50-249", label: "50 à 249 personnes" },
  { value: "250+", label: "250 personnes ou plus" },
] as const;
