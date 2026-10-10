# Décisions à valider avant le lancement

Quatre colonnes, sans rien présenter comme acquis : **implanté** (dans le code), **vérifié** (par un test lancé), **à configurer** (réglage externe), **validation juridique nécessaire**.

| Sujet | Implanté | Vérifié | À configurer | Validation juridique |
|---|---|---|---|---|
| Isolation des données entre entreprises (RLS) | Oui | Oui, tests pgTAP | Non | Non |
| Rôles et statuts non modifiables par l'utilisateur | Oui | Oui, tests pgTAP | Non | Non |
| Accès admin limité et journalisé | Oui | Oui, tests pgTAP et parcours | MFA des admins dans Supabase | Non |
| Formulaire de démo : minimisation, information sous le formulaire | Oui | Oui, tests de parcours | Non | Texte d'information et base juridique |
| Durées de conservation et purge | Oui (`purge_expired_data`) | Fonction testée en local ; planification à vérifier en production | Vérifier `pg_cron` en production | Durées (`conservation.md`) |
| Droits des personnes (demandes, échéance, export JSON) | Oui | Oui, tests de parcours | Non | Procédure de vérification d'identité |
| Suppression de compte en deux temps | Oui | Oui, tests pgTAP | Non | Délai de grâce de 30 jours, données à conserver |
| Cookies (uniquement nécessaires, gestionnaire prêt) | Oui | Oui, tests unitaires et parcours | Non | Non, tant qu'aucun traceur n'est ajouté |
| Politique de confidentialité | Trame | Non | Non | Oui : identité, bases juridiques, destinataires, transferts |
| Mentions légales | Trame | Non | Non | Oui : identité de l'éditeur, hébergeurs |
| CGU / CGV | Trames | Non | Non | Oui : rédaction complète par un professionnel |
| Sous-traitants (DPA, transferts) | Liste | Non | Accepter les DPA Supabase et Vercel | Oui : garanties de transfert hors UE |
| Région UE pour la base | Documentée | Non | Choisir l'UE à la création du projet Supabase | Non |
| SMTP dédié | Modèles prêts | Non | Oui | DPA du prestataire |
| CAPTCHA de l'authentification | Non | Non | Oui (Supabase Auth, Turnstile) | Mention dans la politique de confidentialité |
| Rôle de SpendEdge pour les futurs modules (sous-traitant du client) | Non | Non | Non | Oui : contrat de sous-traitance (article 28) à proposer aux clients |
| AIPD pour l'agent IA et l'accès aux boîtes e-mail | Non | Non | Non | Oui, avant développement (`analyse-risques.md`) |

**Ce qui dépend de l'activité ou des contrats d'Hugo** : identité légale, coordonnées, choix des prestataires, durées de conservation, rédaction des CGU, CGV et du contrat de sous-traitance, décision AIPD.
