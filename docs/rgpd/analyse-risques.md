# Analyse des risques (base de l'analyse RGPD)

État au 2026-10-10, V1. Matrice : probabilité × impact → niveau (Critique / Élevé / Moyen / Faible). Responsable par défaut : Hugo (responsable du traitement). « Atténué » signifie qu'une mesure existe dans le code ou la base ; le risque résiduel reste à accepter par Hugo.

Aucun de ces éléments ne vaut conformité : ils documentent l'état réel pour la décision humaine.

## Registre priorisé

| # | Risque | Catégorie | Prob. | Impact | Niveau | Mesures en place | Reste à faire | Statut |
|---|---|---|---|---|---|---|---|---|
| R1 | Un client accède aux données d'une autre entreprise | Sécurité | Faible | Élevé | Moyen | RLS sur toutes les tables, `can_access_company` (membre + compte actif + entreprise active), tests pgTAP d'accès croisé | Rejouer les tests à chaque migration ; étendre la même règle aux futurs modules | Atténué |
| R2 | Compte administrateur compromis | Sécurité | Moyenne | Élevé | Élevé | Rôle vérifié en base à chaque requête, admin suspendu sans droits, actions et consultations sensibles journalisées, aucun admin ne peut destituer un autre | Activer la double authentification (MFA) Supabase pour les admins ; mot de passe unique et gestionnaire de mots de passe | Ouvert |
| R3 | Force brute ou création massive de comptes via l'API Supabase Auth directe | Sécurité | Moyenne | Moyen | Moyen | Limites applicatives sur le site, limites intégrées Supabase, CGU non déduites des métadonnées | Activer le CAPTCHA Supabase Auth (Turnstile) ; vérifier les limites du projet hébergé | Ouvert |
| R4 | Fuite de la clé secrète Supabase | Sécurité | Faible | Élevé | Moyen | Clé uniquement côté serveur (`server-only`), jamais commitée, `.env*` ignorés par git | Stocker dans les variables Vercel ; procédure de rotation (`incidents.md`) | Atténué |
| R5 | Données personnelles conservées trop longtemps | Conformité | Moyenne | Moyen | Moyen | Purge quotidienne (`purge_expired_data`), empreinte IP effacée à 30 jours, demandes de démo 3 ans après le dernier échange | Valider les durées (`conservation.md`) ; vérifier que `pg_cron` tourne en production | Atténué |
| R6 | Transfert hors UE non encadré (hébergeur, futurs e-mail et IA) | Conformité | Élevée | Moyen | Élevé | Base Supabase prévue en région UE | Vérifier les DPA et garanties (CCT, DPF) de Vercel, Supabase, futur SMTP ; compléter la politique de confidentialité | Ouvert |
| R7 | Mentions légales et politique de confidentialité incomplètes à la mise en ligne | Conformité | Élevée | Moyen | Élevé | Champs `[À COMPLÉTER]` visibles, bandeau « en cours de finalisation » | Compléter et faire relire par un professionnel avant production | Ouvert |
| R8 | **Futur** : accès de l'agent aux boîtes e-mail des clients (lecture de messages sans rapport, jetons volés) | Sécurité / Conformité | Moyenne | Élevé | Élevé | Règles permanentes (`CLAUDE.md`) : OAuth, moindre privilège, jetons chiffrés, aucune lecture hors demandes d'achat | AIPD probablement nécessaire avant développement ; choix des portées OAuth ; chiffrement des jetons | Ouvert (futur) |
| R9 | **Futur** : données transmises à un fournisseur d'IA (réutilisation, entraînement, localisation) | Conformité | Moyenne | Élevé | Élevé | Règle : minimum de données, aucun entraînement sans accord | Choix du fournisseur sur critères RGPD, DPA, option « zéro rétention » | Ouvert (futur) |
| R10 | **Futur** : l'agent envoie un e-mail erroné, en double, ou engage le client | Opérationnel / Réputation | Moyenne | Élevé | Élevé | Règles : jamais de commande sans autorisation, idempotence, mode simulé en développement | Validation avant envoi par défaut, limites d'envoi par client, journal de l'agent | Ouvert (futur) |
| R11 | Confidentialité commerciale (prix fournisseurs d'un client visibles par un autre) | Sécurité / Réputation | Faible | Élevé | Moyen | Isolation par `company_id` en base | Même règle pour catalogues, offres et comparaisons futures ; tests d'accès croisé par module | Atténué |
| R12 | Données d'une entreprise après la fin de l'abonnement | Conformité | Moyenne | Moyen | Moyen | Suppression de compte en deux temps, anonymisation | Définir la durée de restitution puis suppression par entreprise, à écrire dans les CGV | Ouvert |
| R13 | E-mails d'authentification non reçus (SMTP intégré plafonné) | Opérationnel | Élevée | Moyen | Élevé | Modèles français versionnés | Brancher un SMTP dédié avant production | Ouvert |
| R14 | Indisponibilité ou perte de données chez un prestataire | Opérationnel | Faible | Élevé | Moyen | Données en base managée | Vérifier les sauvegardes du plan Supabase choisi ; tester une restauration | Ouvert |
| R15 | Accès admin non justifié aux données sensibles | Conformité | Faible | Moyen | Faible | Consultations de comptes, démos et exports journalisées dans `audit_logs`, non modifiable | Revue périodique du journal | Atténué |

## Besoin d'une AIPD (analyse d'impact)

À évaluer par Hugo (avec un conseil si besoin). Les critères CNIL qui pourraient s'appliquer **quand l'agent IA et l'accès aux boîtes e-mail seront développés** : traitement à grande échelle de communications, usage innovant (IA), croisement de données. **Pour la V1 seule** (vitrine, démos, comptes), une AIPD ne paraît pas requise, mais ce n'est pas une validation juridique.

## Révision

Revoir ce registre à chaque nouveau module (notamment avant l'agent IA et la connexion des boîtes e-mail) et à chaque nouveau prestataire.
