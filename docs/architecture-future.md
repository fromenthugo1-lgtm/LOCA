# Architecture des versions futures

Les règles de comportement (agent IA, boîtes e-mail, IA et données, traçabilité, coûts) sont dans `CLAUDE.md`, section « Règles pour les versions futures » : elles ne sont pas recopiées ici. Ce document décrit comment l'architecture V1 les rend possibles.

## Ce qui est déjà en place

- **Isolation par entreprise.** Toute future table métier porte un `company_id` et une politique RLS fondée sur `private.can_access_company(company_id)` (membre, compte actif, entreprise active). Les administrateurs passent par `private.is_super_admin()`. Modèle à copier : `subscriptions`.
- **Rôles.** `member` et `company_admin` par entreprise ; `has_company_role` permet de réserver une action à l'administrateur de l'entreprise (validation avant envoi, règles d'achat).
- **Services remplaçables.** `src/services/email/` (envoi désactivé en V1), `src/services/payments/`. Le futur service IA suivra le même modèle : une interface, une implémentation simulée pour le développement, une implémentation réelle activée par configuration.
- **Journal d'audit** générique (déclencheur `private.audit_row_change`), réutilisable sur les futures tables.

## Modules à venir et emplacement prévu

| Module | Tables (toutes avec `company_id`) | Code |
|---|---|---|
| Fournisseurs et catalogues | `suppliers`, `supplier_contacts`, `product_categories`, `products`, `product_codes`, `supplier_products` | `src/features/suppliers/`, `src/features/catalog/` |
| Demandes d'achat | `purchase_requests`, `purchase_request_lines` | `src/features/purchase-requests/` |
| Consultation des fournisseurs | `supplier_quotes_requests` (une par fournisseur et par demande, avec clé d'idempotence unique) | `src/features/sourcing/` |
| Boîtes e-mail | `mailbox_connections` (fournisseur OAuth, portées, jetons chiffrés, date de révocation) | `src/services/mailbox/` : trois services séparés (envoi, suivi, récupération) |
| Agent IA | `agent_runs` (identifiant de demande, action, statut `pending` / `running` / `done` / `failed` / `needs_human`, résultat ou motif, tentatives, horodatages) | `src/services/ai/`, tâches de fond |
| Comparaison | `supplier_quotes`, `quote_lines` (prix, délai, caractéristiques, champs manquants signalés) | `src/features/comparison/` |
| Consommation | `usage_events` (type IA ou e-mail, quantité, coût estimé, par entreprise) | Mesure, puis limites des formules |

## Principes techniques

- **Idempotence** : chaque envoi d'e-mail a une clé unique (`request_id` + `supplier_id` + version) ; un second envoi avec la même clé est refusé en base.
- **États explicites** : un e-mail n'est « envoyé » qu'après confirmation du prestataire, une réponse « reçue » qu'une fois récupérée et rattachée.
- **Tâches de fond** : file de travaux en base ou service managé ; aucune tâche longue dans une requête de page.
- **Jetons OAuth** : chiffrés côté serveur (clé dans les variables d'environnement, jamais en base en clair), jamais renvoyés au navigateur.
- **Développement** : mode simulé par défaut, aucun envoi réel sans configuration explicite d'une boîte de test.
- **Avant de coder l'agent et les boîtes e-mail** : AIPD (`docs/rgpd/analyse-risques.md`), choix du fournisseur d'IA sur critères RGPD (`docs/rgpd/sous-traitants.md`).
