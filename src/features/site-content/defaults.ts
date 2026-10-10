import type { SiteContent, SiteContentKey } from "./schemas";

/**
 * Textes par défaut du site. Ils s'affichent tant qu'aucune version n'est publiée depuis
 * l'administration. Règles de rédaction : DESIGN.md, « Ton des textes ».
 * Les textes fournis par Hugo (hero, appel à l'action final) ne se modifient qu'avec son accord.
 */
export const siteContentDefaults: { [K in SiteContentKey]: SiteContent<K> } = {
  "home.hero": {
    eyebrow: "Achats professionnels",
    title: "Vos demandes de prix fournisseurs, automatisées par l'IA.",
    subtitle:
      "SpendEdge aide les entreprises à consulter leurs fournisseurs plus simplement, à gagner du temps sur leurs achats et à comparer les propositions reçues.",
    primaryCta: "Demander une démonstration",
    secondaryCta: "Découvrir le fonctionnement",
  },

  "home.problem": {
    eyebrow: "Le constat",
    title: "Consulter ses fournisseurs prend plus de temps qu'on ne le pense.",
    intro:
      "Pour un même besoin, il faut écrire à plusieurs fournisseurs, attendre, relancer, puis remettre les réponses dans l'ordre. Ce temps ne sert ni vos clients ni votre production.",
    items: [
      { id: "contact", title: "Contacter chaque fournisseur", text: "Un même besoin part en plusieurs e-mails ou appels, rédigés et envoyés un par un." },
      { id: "people", title: "Trouver le bon interlocuteur", text: "Le contact a changé, le commercial ne répond pas, et votre demande attend." },
      { id: "repeat", title: "Répéter le même besoin", text: "Quantités, références, délai souhaité : vous réécrivez tout pour chaque fournisseur." },
      { id: "scattered", title: "Suivre des réponses éparpillées", text: "Les devis arrivent par e-mail, par téléphone ou en pièce jointe. Il faut tout rassembler." },
      { id: "compare", title: "Comparer à la main", text: "Prix, délais, frais de livraison : la comparaison se fait ligne par ligne dans un tableur." },
      { id: "admin", title: "Perdre du temps administratif", text: "Chaque consultation prend du temps sur le chantier, l'atelier ou le suivi de vos clients." },
    ],
  },

  "home.solution": {
    eyebrow: "La solution",
    title: "Vous décrivez le besoin. SpendEdge s'occupe des demandes.",
    intro:
      "SpendEdge s'appuie sur vos fournisseurs et vos produits, configurés avec vous. Chaque fonction est indiquée avec son état réel d'avancement.",
    items: [
      { id: "request", status: "in_development", title: "Une demande centralisée", text: "Vous saisissez votre besoin une seule fois : produits, quantités, caractéristiques, délai." },
      { id: "match", status: "in_development", title: "Les bons fournisseurs, identifiés", text: "Le besoin est rapproché du catalogue configuré pour votre entreprise : seuls les fournisseurs concernés sont retenus." },
      { id: "send", status: "in_development", title: "Des e-mails envoyés selon vos règles", text: "Les demandes partent depuis votre boîte professionnelle, avec votre validation si vous la souhaitez." },
      { id: "track", status: "in_development", title: "Un suivi des échanges", text: "Vous voyez quelles demandes sont envoyées, lesquelles ont reçu une réponse, et celles à relancer." },
      { id: "compare", status: "vision", title: "Une comparaison préparée", text: "Les réponses sont rassemblées pour comparer prix, délais et caractéristiques d'un coup d'œil." },
    ],
  },

  "home.walkthrough": {
    eyebrow: "Fonctionnement",
    title: "Une demande de prix, de la saisie à la comparaison.",
    intro: "Voici le parcours prévu dans SpendEdge, illustré avec des données fictives.",
    steps: [
      { id: "need", title: "1. Le besoin", text: "Vous saisissez les produits, les quantités et les caractéristiques attendues, avec la date de livraison souhaitée." },
      { id: "match", title: "2. L'identification", text: "SpendEdge rapproche chaque ligne des catégories et codes produits configurés, puis retient les fournisseurs capables d'y répondre." },
      { id: "send", title: "3. La consultation", text: "Les e-mails sont préparés pour chaque fournisseur. Ils partent après votre validation ou directement, selon les autorisations que vous avez données." },
      { id: "track", title: "4. Le suivi", text: "Chaque demande a un statut clair : en attente, envoyée, réponse reçue ou anomalie à vérifier." },
      { id: "compare", title: "5. La comparaison", text: "Les réponses sont présentées côte à côte : prix, délai, caractéristiques. Les informations manquantes sont signalées." },
    ],
  },

  "home.features": {
    eyebrow: "Fonctionnalités",
    title: "Ce que SpendEdge prend en charge.",
    intro: "Les fonctions marquées « Prévu » sont en cours de développement. La démonstration vous montre ce qui est disponible à date.",
    items: [
      { id: "needs", status: "planned", title: "Centralisation des besoins", text: "Toutes vos demandes d'achat au même endroit, avec leur historique." },
      { id: "suppliers", status: "planned", title: "Référencement des fournisseurs", text: "Vos fournisseurs, leurs coordonnées et les produits qu'ils proposent, tenus à jour." },
      { id: "matching", status: "planned", title: "Correspondance produits et fournisseurs", text: "Une codification de vos produits qui relie chaque besoin aux fournisseurs pertinents." },
      { id: "automation", status: "planned", title: "Automatisation des demandes", text: "Des e-mails de demande de prix rédigés et envoyés selon vos règles." },
      { id: "tracking", status: "planned", title: "Suivi des réponses", text: "Les réponses reçues sont rattachées à la bonne demande, les relances sont repérées." },
      { id: "comparison", status: "planned", title: "Comparaison des offres", text: "Prix, délais et caractéristiques présentés côte à côte." },
      { id: "setup", status: "planned", title: "Configuration personnalisée", text: "Un environnement préparé pour votre activité, vos fournisseurs et vos habitudes d'achat." },
    ],
  },

  "home.sectors": {
    eyebrow: "Secteurs d'activité",
    title: "Pensé pour les entreprises qui consultent souvent leurs fournisseurs.",
    intro: "Artisans, TPE ou PME : SpendEdge s'adapte à vos produits et à votre façon d'acheter.",
    items: [
      { id: "construction", title: "BTP et bâtiment", text: "Matériaux, quincaillerie, location de matériel, pour chaque chantier." },
      { id: "earthworks", title: "Terrassement", text: "Granulats, transport, engins et fournitures de voirie." },
      { id: "landscaping", title: "Paysagisme", text: "Végétaux, terre, arrosage, mobilier extérieur." },
      { id: "electrical", title: "Électricité", text: "Câbles, appareillage, tableaux et matériel d'éclairage." },
      { id: "industry", title: "PME industrielles", text: "Matières premières, pièces, consommables et sous-traitance." },
    ],
    note: "Votre secteur n'apparaît pas ? SpendEdge convient à toute entreprise qui consulte régulièrement plusieurs fournisseurs.",
  },

  "home.onboarding": {
    eyebrow: "Mise en service",
    title: "Votre environnement est préparé avec vous, pas laissé à configurer seul.",
    intro: "Il n'existe pas de base fournisseurs universelle : SpendEdge s'appuie sur les vôtres. Nous les référençons ensemble avant le démarrage.",
    steps: [
      { id: "talk", title: "Échange sur vos besoins", text: "Ce que vous achetez, à quelle fréquence, auprès de qui." },
      { id: "suppliers", title: "Identification des fournisseurs", text: "Vos fournisseurs actuels et ceux que vous souhaitez consulter." },
      { id: "catalog", title: "Référencement des produits", text: "Vos produits et leurs correspondances avec chaque fournisseur." },
      { id: "settings", title: "Paramétrage", text: "Vos règles d'envoi, de validation et vos utilisateurs." },
      { id: "start", title: "Prise en main", text: "Une session pour lancer vos premières demandes." },
    ],
    note: "La mise en service est facturée une seule fois, séparément de l'abonnement mensuel. Son contenu et son prix sont définis après le premier échange.",
  },

  "home.pricing": {
    eyebrow: "Tarifs",
    title: "Une mise en service, puis un abonnement mensuel.",
    intro: "Les frais de mise en service sont ponctuels. L'abonnement dépend du nombre d'utilisateurs et du volume de demandes. Une démonstration précède toute souscription.",
    emptyTitle: "Offre adaptée à votre activité.",
    emptyText: "Tarification sur devis. Nous vous présentons la formule adaptée après la démonstration.",
    cta: "Demander une démonstration",
    detailsLink: "Voir le détail des formules",
  },

  "home.faq": {
    eyebrow: "Questions fréquentes",
    title: "Vos questions sur SpendEdge.",
    intro: "Vous ne trouvez pas votre réponse ? Posez-la lors de la démonstration.",
  },

  "home.finalCta": {
    title: "Et si vous passiez moins de temps à consulter vos fournisseurs ?",
    text: "Présentez-nous votre façon d'acheter. Nous vous montrons ce que SpendEdge peut prendre en charge.",
    cta: "Demander une démonstration",
  },

  "site.contact": {
    intro: "Pour une démonstration, utilisez le formulaire dédié. Pour toute autre question, écrivez-nous.",
    email: "[À COMPLÉTER : adresse e-mail de contact]",
    phone: "[À COMPLÉTER : téléphone]",
    address: "[À COMPLÉTER : adresse postale]",
    hours: "[À COMPLÉTER : horaires de réponse]",
  },

  "site.footer": {
    tagline: "Déléguez vos demandes d'achat. Concentrez-vous sur votre activité.",
  },

  "demo.page": {
    title: "Demander une démonstration",
    intro: "Présentez-nous votre activité en quelques lignes. Nous vous recontactons pour convenir d'un créneau et vous montrer SpendEdge sur un cas proche du vôtre.",
    nextSteps: [
      { id: "call", title: "Prise de contact", text: "Nous revenons vers vous pour fixer un rendez-vous." },
      { id: "demo", title: "Démonstration", text: "Nous parcourons ensemble vos besoins et ce que SpendEdge peut faire aujourd'hui." },
      { id: "offer", title: "Proposition", text: "Si SpendEdge vous convient, nous vous proposons une mise en service et une formule." },
    ],
    privacyNotice:
      "Les informations de ce formulaire servent uniquement à traiter votre demande de démonstration et à vous recontacter. Elles sont accessibles à l'équipe SpendEdge et conservées au maximum trois ans après notre dernier échange. Vous pouvez y accéder, les faire corriger ou supprimer à tout moment.",
    successTitle: "Votre demande est bien enregistrée.",
    successText: "Nous vous recontactons pour convenir d'un créneau de démonstration.",
  },
};
