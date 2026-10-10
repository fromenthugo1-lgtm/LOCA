export type LegalSlug = "mentions-legales" | "confidentialite" | "cgu" | "cgv";

export type LegalPage = { slug: LegalSlug; title: string; body: string; version: string; publishedAt: string | null };

/**
 * Textes juridiques par défaut. Ce sont des trames : chaque information inconnue est
 * marquée [À COMPLÉTER] et doit être renseignée (et relue par un professionnel du droit)
 * avant la mise en production. Liste des champs bloquants : README.md.
 * Format : « ## » titre, « - » élément de liste, ligne vide = nouveau paragraphe,
 * **gras**, [lien](/chemin).
 */
export const legalDefaults: Record<LegalSlug, Omit<LegalPage, "slug" | "publishedAt">> = {
  "mentions-legales": {
    title: "Mentions légales",
    version: "v0-projet",
    body: `## Éditeur du site

- Nom ou raison sociale : [À COMPLÉTER]
- Forme juridique et capital social : [À COMPLÉTER]
- Adresse du siège : [À COMPLÉTER]
- Numéro SIREN ou SIRET : [À COMPLÉTER]
- Immatriculation (RCS ou RNE) : [À COMPLÉTER]
- Numéro de TVA intracommunautaire : [À COMPLÉTER]
- Directeur ou directrice de la publication : [À COMPLÉTER]
- Contact : [À COMPLÉTER : adresse e-mail et téléphone]

## Hébergement

- Hébergeur du site : [À COMPLÉTER : nom, adresse et téléphone de l'hébergeur]
- Hébergeur de la base de données : [À COMPLÉTER : nom, adresse et région d'hébergement]

## Propriété intellectuelle

Les contenus de ce site (textes, logo, maquettes d'interface) sont la propriété de l'éditeur, sauf mention contraire. Toute reproduction sans autorisation est interdite.

## Données personnelles

Le traitement de vos données est décrit dans la [politique de confidentialité](/confidentialite).`,
  },

  confidentialite: {
    title: "Politique de confidentialité",
    version: "v0-projet",
    body: `## Responsable du traitement

[À COMPLÉTER : identité et coordonnées du responsable du traitement]

Contact pour vos données personnelles : [À COMPLÉTER : adresse e-mail dédiée]

## Données traitées et finalités

**Demande de démonstration.** Nom et prénom, e-mail professionnel, entreprise, fonction, secteur, et si vous les indiquez : taille de l'entreprise, téléphone, description du besoin. Finalité : traiter votre demande et vous recontacter. Base juridique : [À COMPLÉTER : à valider, par exemple mesures précontractuelles ou intérêt légitime]. Durée de conservation : trois ans au plus après le dernier échange [À COMPLÉTER : à valider].

**Compte utilisateur.** Adresse e-mail, mot de passe (stocké sous forme chiffrée par notre prestataire d'authentification, jamais lisible par nous), nom si vous l'indiquez, entreprise et rôle, date d'acceptation des conditions d'utilisation. Finalité : vous donner accès au service. Base juridique : exécution du contrat [À COMPLÉTER : à valider]. Durée : pendant la durée du compte, puis suppression ou anonymisation selon la procédure décrite ci-dessous [À COMPLÉTER : à valider].

**Sécurité.** Pour limiter les abus, une empreinte non réversible de votre adresse IP est conservée trente jours au plus. Votre adresse IP n'est jamais enregistrée en clair.

## Destinataires

Vos données sont accessibles à l'équipe SpendEdge habilitée, et traitées pour notre compte par nos prestataires techniques : [À COMPLÉTER : liste des sous-traitants, voir le registre interne].

## Transferts hors de l'Union européenne

[À COMPLÉTER : préciser si un prestataire traite des données hors de l'Union européenne et les garanties applicables]

## Vos droits

Vous pouvez demander l'accès à vos données, leur rectification, leur effacement, la limitation du traitement, leur portabilité, vous opposer au traitement ou retirer votre consentement. Écrivez à [À COMPLÉTER : adresse e-mail dédiée]. Nous répondons dans un délai d'un mois. Une vérification d'identité proportionnée peut vous être demandée.

Vous pouvez aussi introduire une réclamation auprès de la CNIL (www.cnil.fr).

## Suppression du compte

Une suppression de compte désactive d'abord l'accès, puis les données sont supprimées ou anonymisées après un délai de grâce de trente jours, sauf obligation légale de conservation (par exemple comptable).

## Cookies

Ce site utilise uniquement des cookies strictement nécessaires : maintien de votre session de connexion et mémorisation de vos choix en matière de cookies. Aucun cookie de mesure d'audience ou de publicité n'est déposé. Vous pouvez consulter vos choix à tout moment via le lien « Gérer les cookies » en bas de page.`,
  },

  cgu: {
    title: "Conditions générales d'utilisation",
    version: "v0-projet",
    body: `## Objet

Les présentes conditions encadrent l'utilisation du site et de l'espace client SpendEdge. [À COMPLÉTER : texte à faire relire par un professionnel du droit avant la mise en production]

## Éditeur

[À COMPLÉTER : identité de l'éditeur, voir les mentions légales]

## Création de compte

La création d'un compte nécessite une adresse e-mail valide et l'acceptation des présentes conditions. L'accès aux fonctions du service est ouvert après une démonstration et l'activation du compte par SpendEdge.

## Obligations de l'utilisateur

Vous vous engagez à fournir des informations exactes, à garder votre mot de passe confidentiel et à ne pas tenter d'accéder aux données d'autres utilisateurs ou d'autres entreprises.

## Disponibilité du service

[À COMPLÉTER : engagements de disponibilité et de maintenance]

## Données personnelles

Voir la [politique de confidentialité](/confidentialite).

## Responsabilité

[À COMPLÉTER]

## Suspension et suppression du compte

SpendEdge peut suspendre un compte en cas de manquement aux présentes conditions. Vous pouvez demander la suppression de votre compte depuis votre espace.

## Modification des conditions

En cas de modification, la nouvelle version vous est présentée et doit être acceptée lors de votre prochaine connexion.

## Droit applicable

[À COMPLÉTER : droit applicable et juridiction compétente]`,
  },

  cgv: {
    title: "Conditions générales de vente",
    version: "v0-projet",
    body: `## Statut de ce document

Les conditions générales de vente sont en cours de rédaction. Aucun paiement n'est possible sur ce site à ce jour : toute souscription fait suite à une démonstration et à une proposition écrite.

## Contenu à prévoir

- Mise en service : contenu, prix, facturation ponctuelle [À COMPLÉTER]
- Abonnement mensuel : formules, prix, révision des prix [À COMPLÉTER]
- Modalités de paiement et de facturation [À COMPLÉTER]
- Durée, renouvellement et résiliation [À COMPLÉTER]
- Changement de formule [À COMPLÉTER]
- Retard ou défaut de paiement [À COMPLÉTER]
- Sort des données en fin d'abonnement [À COMPLÉTER]
- Responsabilité et droit applicable [À COMPLÉTER]`,
  },
};
