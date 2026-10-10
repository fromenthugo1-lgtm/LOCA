# ROADMAP

## État

| Phase | Contenu | État |
| --- | --- | --- |
| 1 | Structure, identité (DESIGN.md, CLAUDE.md, tokens, logo, composants) | Terminée |
| 2 | Site vitrine (accueil, démonstration au défilement, offres, FAQ, pied de page) | Terminée |
| 3 | Pages commerciales (demande de démo, pages juridiques, formules) | Terminée |
| 4 | Authentification (inscription, connexion, mot de passe oublié, états de compte) | Terminée |
| 5 | Données et sécurité (schéma, RLS, migrations, tests pgTAP) | Terminée |
| 6 | Administration initiale (démos, comptes, formules, contenus, RGPD) | Terminée |
| 7 | Vérification (pages, responsive, droits, accessibilité, audit « ne fait pas IA ») | À faire |
| 8 | Documentation (README, .env.example, RGPD, rapport final) | À faire |

Détail des exigences : `docs/SPEC.md`. Décisions : `docs/DECISIONS.md`.

## Modules futurs (hors V1)

L'architecture les permet déjà (clé `company_id`, fonction `private.can_access_company`, interfaces de services remplaçables). Rien n'est développé.

| Module | Préparé en V1 | Reste à faire |
| --- | --- | --- |
| Fournisseurs, catalogues, codes produits | Isolation par entreprise prête | Tables, écrans, import |
| Demandes d'achat | Idem | Saisie, statuts, historique |
| Agent IA d'achat | Règles permanentes (CLAUDE.md), `docs/architecture-future.md` | Choix du fournisseur d'IA (RGPD), orchestration, journaux d'agent |
| Connexion des boîtes e-mail (Gmail, Microsoft 365) | Règles OAuth et moindre privilège | OAuth, chiffrement des jetons, trois services séparés (envoi, suivi, récupération) |
| Comparaison des offres | Néant | Moteur de comparaison |
| Abonnements, paiements, résiliations | Tables `plans`, `subscriptions`, `billing_events` | Compte Stripe, webhooks signés, portail client (`docs/paiements.md`) |
| Périodes d'essai, accès gratuits manuels | Statut `trialing`, `trial_ends_at` | Écrans d'administration |
| Codes promotionnels, affiliation, campagnes | Néant | Tout |
| Statistiques (inscriptions, conversion, chiffre d'affaires, résiliations) | Néant (aucune statistique simulée) | Tableaux de bord sur données réelles |
| Consommation et coûts IA et messagerie | Limites prévues dans `plans` | Mesure par entreprise |
| Journaux d'erreurs, e-mails échoués, tâches bloquées | `audit_logs` pour l'administration | Supervision technique |
| Paramètres généraux | Néant | Écran d'administration |
| Intégrations externes | Interfaces `src/services/` | Connecteurs |
| Connexion Google / Microsoft | Supabase Auth le permet | Activation des fournisseurs OAuth |
| E-mails transactionnels (confirmation de démo) | Interface d'envoi désactivée | Prestataire SMTP ou API |
