# Procédure en cas d'incident de sécurité ou de violation de données

Cette procédure organise la réaction ; elle ne remplace pas la décision humaine. Responsable : Hugo (responsable du traitement). Tenir un registre des incidents, même sans notification (date, faits, données, personnes, mesures, décision).

## Exemples d'incidents

- Accès non autorisé à un compte ou à l'administration.
- Fuite de données (export envoyé à la mauvaise personne, base exposée).
- Perte ou altération de données.
- Clé secrète, jeton ou mot de passe compromis.
- Erreur d'isolation : un client voit les données d'un autre.
- Incident chez un prestataire (Supabase, Vercel, SMTP, futur fournisseur d'IA).

## Étapes

1. **Contenir (immédiatement)**
   - Compte compromis : le suspendre dans `/admin/comptes` (le rôle et les accès tombent en base aussitôt). Pour un admin : retirer sa ligne `platform_admins` en SQL.
   - Clé secrète compromise : la régénérer dans Supabase (Project Settings > API Keys), la remplacer dans Vercel (`SUPABASE_SECRET_KEY`), redéployer.
   - `IP_HASH_SECRET` compromis : le remplacer (les compteurs anti-abus repartent de zéro).
   - Erreur d'isolation : désactiver la fonction concernée (redéployer la version précédente), puis corriger et ajouter un test pgTAP qui reproduit l'erreur.
2. **Évaluer (dans les 24 h)** : quelles données, combien de personnes, quelles entreprises, risque pour les personnes (faible, réel, élevé). S'appuyer sur `audit_logs` et les journaux Supabase et Vercel.
3. **Notifier la CNIL** si la violation présente un risque pour les droits et libertés des personnes : **dans les 72 heures** après en avoir pris connaissance, sur notifications.cnil.fr. Si toutes les informations ne sont pas connues, notifier quand même puis compléter.
4. **Informer les personnes** sans délai si le risque est **élevé** (message clair : nature, conséquences, mesures, contact).
5. **Clients professionnels** : pour les traitements où SpendEdge est sous-traitant (modules futurs), prévenir le client sans délai pour qu'il puisse notifier lui-même.
6. **Corriger et documenter** : cause, correctif, test ajouté, mise à jour de `analyse-risques.md`.

## Contacts

- CNIL : https://www.cnil.fr (notifications en ligne).
- Supabase : support depuis le tableau de bord.
- Vercel : support depuis le tableau de bord.
- Conseil juridique : [À COMPLÉTER].
