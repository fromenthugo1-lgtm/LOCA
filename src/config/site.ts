import { routes } from "./routes";

export const siteConfig = {
  name: "SpendEdge",
  locale: "fr_FR",
  /** Description par défaut (balise meta et partage). */
  description:
    "SpendEdge automatise vos demandes de prix fournisseurs : un besoin saisi une fois, les bons fournisseurs consultés, les réponses rassemblées pour comparer.",
} as const;

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "Fonctionnement", href: "/#fonctionnement" },
  { label: "Fonctionnalités", href: "/#fonctionnalites" },
  { label: "Secteurs d'activité", href: "/#secteurs" },
  { label: "Tarifs", href: "/#tarifs" },
  { label: "FAQ", href: "/#faq" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Produit",
    items: [
      { label: "Fonctionnement", href: "/#fonctionnement" },
      { label: "Fonctionnalités", href: "/#fonctionnalites" },
      { label: "Tarifs", href: routes.pricing },
      { label: "Questions fréquentes", href: "/#faq" },
    ],
  },
  {
    title: "Contact",
    items: [
      { label: "Demander une démonstration", href: routes.demo },
      { label: "Nous contacter", href: routes.contact },
      { label: "Se connecter", href: routes.signIn },
    ],
  },
  {
    title: "Informations légales",
    items: [
      { label: "Mentions légales", href: routes.legalNotice },
      { label: "Politique de confidentialité", href: routes.privacy },
      { label: "Conditions d'utilisation", href: routes.terms },
      { label: "Conditions de vente", href: routes.salesTerms },
    ],
  },
];
