export type AdminNavItem = { label: string; href?: string; soon?: boolean };

/** Modules d'administration. Les modules futurs sont affichés désactivés (« Bientôt »). */
export const adminNav: { title: string; items: AdminNavItem[] }[] = [
  {
    title: "Opérations",
    items: [
      { label: "Vue d'ensemble", href: "/admin" },
      { label: "Demandes de démo", href: "/admin/demandes" },
      { label: "Comptes", href: "/admin/comptes" },
      { label: "Entreprises", href: "/admin/entreprises" },
      { label: "Formules", href: "/admin/formules" },
    ],
  },
  {
    title: "Site",
    items: [
      { label: "Contenus", href: "/admin/contenus" },
      { label: "FAQ", href: "/admin/faq" },
      { label: "Pages juridiques", href: "/admin/juridique" },
    ],
  },
  {
    title: "Conformité",
    items: [
      { label: "Demandes RGPD", href: "/admin/rgpd" },
      { label: "Journal d'audit", href: "/admin/journal" },
    ],
  },
  {
    title: "Bientôt",
    items: [
      { label: "Gestion avancée des comptes et entreprises", soon: true },
      { label: "Abonnements et paiements", soon: true },
      { label: "Essais et accès gratuits", soon: true },
      { label: "Codes promo et affiliation", soon: true },
      { label: "Statistiques", soon: true },
      { label: "Consommation IA et e-mails", soon: true },
      { label: "Fournisseurs et catalogues", soon: true },
      { label: "Journaux techniques", soon: true },
      { label: "Intégrations", soon: true },
      { label: "Paramètres", soon: true },
    ],
  },
];
