export type FaqEntry = { question: string; answer: string };

/**
 * Questions par défaut, affichées tant qu'aucune question n'est publiée depuis l'administration.
 * Chaque réponse décrit ce qui existe réellement ; les fonctions futures sont signalées comme telles.
 */
export const faqDefaults: FaqEntry[] = [
  {
    question: "À qui s'adresse SpendEdge ?",
    answer:
      "Aux professionnels qui consultent régulièrement plusieurs fournisseurs : artisans et auto-entrepreneurs, entreprises du bâtiment, du terrassement, du paysagisme ou de l'électricité, PME industrielles, dirigeants et acheteurs qui manquent de temps.",
  },
  {
    question: "Comment fonctionne SpendEdge ?",
    answer:
      "Vous saisissez votre besoin une fois. SpendEdge le rapproche des fournisseurs référencés pour votre entreprise, prépare les demandes de prix, suit les réponses et les rassemble pour les comparer. SpendEdge est en cours de développement : la démonstration vous montre précisément ce qui est disponible aujourd'hui.",
  },
  {
    question: "Avec quels fournisseurs SpendEdge fonctionne-t-il ?",
    answer:
      "Avec les vôtres. SpendEdge ne s'appuie pas sur une base de fournisseurs toute faite : nous référençons avec vous les fournisseurs avec lesquels vous travaillez ou que vous souhaitez consulter.",
  },
  {
    question: "Comment les fournisseurs sont-ils configurés ?",
    answer:
      "Lors de la mise en service, nous enregistrons vos fournisseurs, leurs coordonnées, les catégories et produits qu'ils proposent. Nous créons ensuite une codification qui relie chacun de vos besoins aux fournisseurs capables d'y répondre.",
  },
  {
    question: "En quoi consiste la mise en service ?",
    answer:
      "C'est un accompagnement ponctuel : échange sur vos besoins, identification de vos fournisseurs, référencement de vos produits, paramétrage, puis prise en main. Elle est facturée une seule fois, séparément de l'abonnement.",
  },
  {
    question: "L'IA peut-elle envoyer directement les e-mails ?",
    answer:
      "C'est l'objectif, et cette fonction est en développement. Les envois se feront depuis la boîte que vous aurez autorisée, selon vos règles : validation avant envoi si vous le souhaitez, fournisseurs autorisés, limites d'envoi. SpendEdge ne passera jamais de commande ni n'acceptera d'offre à votre place.",
  },
  {
    question: "Puis-je utiliser ma propre boîte e-mail professionnelle ?",
    answer:
      "C'est prévu. La connexion se fera par l'accès officiel de Gmail ou de Microsoft 365, sans jamais nous communiquer votre mot de passe. Vous pourrez retirer cette autorisation à tout moment.",
  },
  {
    question: "Comment se fait la comparaison des prix et des délais ?",
    answer:
      "Cette fonction est prévue : les réponses reçues seront présentées côte à côte, avec le prix, le délai et les caractéristiques. Une information manquante ou non comparable sera signalée plutôt que devinée.",
  },
  {
    question: "Comment fonctionne l'abonnement ?",
    answer:
      "L'abonnement est mensuel. La formule dépend du nombre d'utilisateurs et du volume de demandes. Les frais de mise en service sont facturés à part, une seule fois. Les tarifs vous sont présentés après la démonstration.",
  },
  {
    question: "Comment demander une démonstration ?",
    answer:
      "Remplissez le formulaire de demande de démonstration. Nous vous recontactons pour convenir d'un créneau. La démonstration est un préalable à toute souscription.",
  },
  {
    question: "Puis-je résilier mon abonnement ?",
    answer:
      "Les conditions de résiliation figurent dans les conditions générales de vente, qui vous sont remises avant toute souscription.",
  },
  {
    question: "Comment mes données sont-elles protégées ?",
    answer:
      "Les données de chaque entreprise sont cloisonnées : un client n'a jamais accès aux données d'un autre. Elles servent uniquement à fournir le service. L'hébergement est prévu dans l'Union européenne. Le détail figure dans la politique de confidentialité.",
  },
];
