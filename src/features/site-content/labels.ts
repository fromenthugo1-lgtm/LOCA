import type { SiteContentKey } from "./schemas";

/** Libellés de l'administration des contenus. */
export const sectionLabels: Record<SiteContentKey, { title: string; where: string }> = {
  "home.hero": { title: "Accueil : en-tête (hero)", where: "Haut de la page d'accueil" },
  "home.problem": { title: "Accueil : le constat", where: "Section « Le constat »" },
  "home.solution": { title: "Accueil : la solution", where: "Section « La solution »" },
  "home.walkthrough": { title: "Accueil : démonstration au défilement", where: "Section « Fonctionnement »" },
  "home.features": { title: "Accueil : fonctionnalités", where: "Section « Fonctionnalités »" },
  "home.sectors": { title: "Accueil : secteurs d'activité", where: "Section « Secteurs »" },
  "home.onboarding": { title: "Accueil et tarifs : mise en service", where: "Section « Mise en service »" },
  "home.pricing": { title: "Accueil et tarifs : formules", where: "Section « Tarifs »" },
  "home.faq": { title: "Accueil : en-tête de la FAQ", where: "Section « Questions fréquentes »" },
  "home.finalCta": { title: "Accueil : appel à l'action final", where: "Bas de la page d'accueil" },
  "site.contact": { title: "Coordonnées", where: "Page Contact" },
  "site.footer": { title: "Pied de page", where: "Toutes les pages publiques" },
  "demo.page": { title: "Page de demande de démonstration", where: "Page /demo" },
};

export const fieldLabels: Record<string, string> = {
  eyebrow: "Sur-titre",
  title: "Titre",
  subtitle: "Sous-titre",
  intro: "Introduction",
  text: "Texte",
  note: "Note",
  status: "État affiché",
  primaryCta: "Bouton principal",
  secondaryCta: "Bouton secondaire",
  cta: "Bouton",
  emptyTitle: "Titre sans formule publiée",
  emptyText: "Texte sans formule publiée",
  detailsLink: "Lien vers le détail des formules",
  email: "E-mail",
  phone: "Téléphone",
  address: "Adresse",
  hours: "Horaires",
  tagline: "Phrase de présentation",
  privacyNotice: "Mention d'information RGPD",
  successTitle: "Titre de confirmation",
  successText: "Texte de confirmation",
  items: "Éléments",
  steps: "Étapes",
  nextSteps: "Étapes suivantes",
};

export const statusOptions = [
  { value: "available", label: "Disponible" },
  { value: "in_development", label: "En développement" },
  { value: "planned", label: "Prévu" },
  { value: "vision", label: "Vision" },
] as const;
