# Durées de conservation

Toutes les durées sont **à valider** par Hugo. Celles marquées « appliquée » sont déjà mises en œuvre par la base (fonction `purge_expired_data`, planifiée chaque nuit à 03 h 17 UTC avec `pg_cron`, et procédure de suppression de compte).

| Catégorie | Durée | Mise en œuvre | État |
|---|---|---|---|
| Demandes de démonstration | 3 ans après le dernier échange (date prolongée à chaque mise à jour par l'admin) | `demo_requests.retain_until`, purge quotidienne | Appliquée, à valider |
| Empreinte IP d'une demande de démo | 30 jours | Effacée par la purge quotidienne | Appliquée, à valider |
| Traces anti-abus (empreintes IP et e-mail) | 2 jours | Purge quotidienne | Appliquée |
| Compte utilisateur | Durée du compte ; après demande de suppression : suspension, puis anonymisation possible après 30 jours de délai de grâce | Fonctions `admin_schedule_account_deletion` et `admin_anonymize_account` (déclenchées par l'admin) | Appliquée (déclenchement manuel), à valider |
| Acceptations des CGU (version, date) | Durée du compte, puis anonymisée avec le profil | Profil | À valider (preuve contractuelle : durée de prescription à confirmer) |
| Historique des versions juridiques | Illimité (preuve de la version acceptée, aucune donnée personnelle) | `legal_page_versions` | Appliquée |
| Demandes d'exercice des droits | 5 ans après clôture | Aucune purge en V1 | À valider puis à automatiser |
| Journal d'audit | À définir (proposition : 1 an) | Aucune purge en V1 | À décider |
| Cookie de choix de consentement | 6 mois | Expiration du cookie | Appliquée |
| Pièces comptables (futur) | 10 ans | Sans objet en V1 | Futur |
| Données d'une entreprise après la fin de l'abonnement (futur) | Restitution puis suppression dans un délai à fixer dans les CGV | Sans objet en V1 | Futur |

## Copies et sauvegardes

Les sauvegardes de la base (gérées par Supabase selon le plan choisi) contiennent des données supprimées tant qu'elles n'ont pas expiré. Procédure : ne jamais restaurer une sauvegarde sans réappliquer ensuite les suppressions et anonymisations intervenues depuis (consulter `audit_logs` : actions `account_anonymized`, `retention_purge`). Durée de rétention des sauvegardes : à vérifier dans le plan Supabase et à indiquer dans la politique de confidentialité.

## Vérifier que la purge tourne (production)

Dans Supabase, SQL Editor :

```sql
select jobname, schedule, active from cron.job;
select * from cron.job_run_details order by start_time desc limit 5;
```
