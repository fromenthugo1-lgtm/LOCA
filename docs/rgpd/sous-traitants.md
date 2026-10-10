# Sous-traitants

Aucun prestataire n'est déclaré conforme : chaque ligne indique ce qui reste à vérifier et à signer. À tenir à jour à chaque nouveau prestataire (règle permanente, `CLAUDE.md`).

| Prestataire | Usage | Données transmises | Localisation | Transfert hors UE | À vérifier / signer | État |
|---|---|---|---|---|---|---|
| Supabase | Base de données, authentification | Toutes les données de l'application | Région à choisir à la création : **UE (Paris ou Francfort)** | Société américaine : accès possible depuis les États-Unis pour le support | DPA Supabase (à accepter dans le tableau de bord), garanties (CCT / Data Privacy Framework), sauvegardes du plan | À configurer |
| Vercel | Hébergement du site et des fonctions serveur | Requêtes, adresses IP dans les journaux, données traitées par les fonctions | Fonctions configurées en `cdg1` (Paris) dans `vercel.json` ; réseau mondial pour les fichiers statiques | Oui (société américaine) | DPA Vercel, garanties de transfert, durée des journaux | À configurer |
| Prestataire SMTP (à choisir) | E-mails d'authentification, plus tard e-mails transactionnels | Adresse e-mail, contenu des messages d'authentification | À choisir de préférence dans l'UE | Selon le choix | DPA, localisation, durée de conservation des journaux d'envoi | À choisir |
| Cloudflare Turnstile (si retenu) | CAPTCHA de l'authentification | Signaux techniques du navigateur | Mondial | Oui | DPA, information dans la politique de confidentialité | Recommandé |
| Stripe (futur) | Paiements | Entreprise, e-mail de facturation ; cartes gérées par Stripe | Irlande pour l'UE | Possible | DPA, CGV, portail client | Futur |
| Fournisseur d'IA (futur) | Agent d'achat | Minimum nécessaire | À choisir | Selon le choix | Conditions de traitement, rétention, sous-traitants, entraînement interdit | Futur |
| Google Workspace / Microsoft 365 (futur) | Connexion des boîtes e-mail des clients (API officielles) | Jetons OAuth, e-mails liés aux demandes | Selon le client | Selon le client | Portées OAuth minimales, validation de l'application par Google / Microsoft | Futur |
| Outil de mesure d'audience | Aucun en V1 | Aucune | Sans objet | Sans objet | Si ajouté : consentement préalable (bandeau automatique, D-008) | Aucun |
| Suivi d'erreurs | Aucun en V1 | Aucune | Sans objet | Sans objet | Si ajouté : filtrer les données personnelles avant envoi | Aucun |
