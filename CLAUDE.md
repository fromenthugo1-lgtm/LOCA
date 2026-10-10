# CLAUDE.md — SpendEdge

SaaS B2B français qui automatise les demandes de prix des professionnels auprès de leurs fournisseurs. V1 = site vitrine, demande de démo, comptes, entreprises, rôles, administration et fondations (pas d'agent IA). Cahier des charges complet : `docs/SPEC.md`. État des phases : `docs/ROADMAP.md`. Décisions techniques : `docs/DECISIONS.md`. Charte visuelle : `DESIGN.md`.

## Au début de chaque session

Relire ce fichier, `DESIGN.md`, `docs/ROADMAP.md` et `git log --oneline -20` avant de reprendre.

## Façon de travailler (permanent)

- Hugo est novice : expliquer en français simple, donner les commandes exactes (où, quoi, ce que ça fait). Ne jamais lui demander ce qu'on peut faire sans risque.
- Ne pas poser de questions mineures : choisir, documenter dans `docs/DECISIONS.md`. Exception : un fait sur son activité (preuves, clients, chiffres, photos, identité légale, domaine) ne se devine jamais → `[À COMPLÉTER]`.
- S'arrêter et expliquer seulement pour : un coût, un compte externe, des identifiants, une action irréversible, un choix d'architecture ou de sécurité majeur.
- Pour chaque tâche : analyser → identifier ce qui change → annoncer l'approche → modifier → vérifier → présenter changements et limites.
- **Honnêteté absolue** : distinguer toujours *fonctionne réellement* / *préparé* / *simulé (données de démo)* / *à configurer*. Ne jamais prétendre avoir lancé un test non lancé.
- Priorités : 1 sécurité des données · 2 fiabilité · 3 besoin métier · 4 maintenabilité · 5 simplicité d'usage · 6 coûts · 7 visuel · 8 évolutivité.
- Pas de fonctionnalité hors périmètre V1 (voir `docs/SPEC.md` §3). Interdits : paiement simulé, fonctionnalité future présentée comme opérationnelle, faux écran d'authentification.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Site en local sur http://localhost:3000 |
| `npm run check` | Lint + types + tests unitaires (contrôle rapide avant commit) |
| `npm run build` | Build de production |
| `npm run test:unit` | Tests Vitest |
| `npm run test:e2e` | Tests Playwright (lance le site) |
| `npm run db:start` / `db:stop` | Supabase local (Docker) |
| `npm run db:reset` | Réapplique migrations + `supabase/seed.sql` |
| `npm run test:db` | Tests pgTAP (RLS, isolation, rôles) |
| `npm run db:types` | Régénère `src/lib/supabase/database.types.ts` |

## Pile et conventions

- Next.js 16 (App Router, `cacheComponents` activé), TypeScript strict, Tailwind CSS 4, Radix (méthode shadcn), Lucide, Supabase (Auth + Postgres), Zod 4.
- **Cette version de Next.js diffère de la mémoire d'entraînement** : lire `node_modules/next/dist/docs/` avant d'utiliser une API. Le middleware s'appelle `proxy` (`src/proxy.ts`). Toute lecture de `cookies()`/`headers()` ou de données non cachées se fait sous `<Suspense>`. Contenu public : `'use cache'` + `cacheTag` ; après une modification admin : `updateTag`.
- Organisation par domaine : `src/features/<domaine>/` (schémas Zod, requêtes, actions serveur, logique), `src/components/` (interface), `src/lib/` (Supabase, env, sécurité), `src/services/` (e-mail, paiement : interfaces remplaçables), `src/config/` (navigation, constantes, textes par défaut).
- Validation : un schéma Zod partagé client/serveur par formulaire, revalidé côté serveur.
- Textes publics : valeurs par défaut dans `src/features/site-content/defaults.ts`, surchargées par la table `site_content`.
- Interface en français, vouvoiement. Code et noms de tables en anglais.

## Identité visuelle

Tout est dans `DESIGN.md`. Ne jamais modifier l'identité en ajoutant une fonctionnalité. Un nouveau choix visuel s'écrit dans `DESIGN.md` avant d'être appliqué. Vérifier les états chargement / succès / erreur / vide.

## Crédibilité : ne pas avoir l'air fait par une IA (permanent)

- Aucun avis, note, compteur, pourcentage, logo client, témoignage, photo générée ou de banque d'images sans confirmation d'Hugo. Pas de section témoignages ou logos tant qu'il n'y a rien de réel.
- Textes : concrets, vouvoiement, phrases courtes. Interdits : « Transformez votre business », « Libérez votre potentiel », « La solution tout-en-un », « Boostez… », « révolutionnaire », tirets longs (—) et demi-cadratins (–) comme ponctuation, listes de trois adjectifs, remplissage, Lorem ipsum.
- Les textes fournis par Hugo (slogan, hero, CTA final) restent par défaut ; toute amélioration se propose avant/après et attend sa validation.
- Aucune trace d'outil : pas de « Made with », pas de métadonnée de générateur, `poweredByHeader: false`.
- `npm run audit:ai` liste les motifs interdits restants dans le dépôt.

## Sécurité (permanent, prime sur tout)

- RLS activée sur **toutes** les tables, politiques par rôle et par `company_id`. Fonctions d'aide `SECURITY DEFINER` avec `set search_path = ''`.
- Autorisations revérifiées côté serveur à chaque opération sensible (`requireUser`, `requireSuperAdmin` dans `src/features/auth/guards.ts`) ; jamais de rôle venu du navigateur.
- Clé secrète Supabase uniquement dans `src/lib/supabase/admin.ts` (`import 'server-only'`). Usage limité aux RPC anti-abus (`submit_demo_request`, `check_rate_limit`), à `record_signup_terms_acceptance` et à l'API d'administration Auth.
- Toute entrée validée côté serveur ; requêtes paramétrées (client Supabase ou fonctions SQL).
- Limitation des formulaires et des connexions (`check_rate_limit`). IP jamais stockée en clair (HMAC avec `IP_HASH_SECRET`).
- En-têtes de sécurité dans `next.config.ts`. Aucun secret, jeton, mot de passe ou contenu confidentiel dans les journaux.
- Accès `super_admin` aux données sensibles limités et journalisés (`audit_logs`).
- Tests d'accès croisé entre entreprises et d'élévation de privilèges dans `supabase/tests/`.
- En cas de doute : la solution la plus sûre.

## RGPD dès la conception (permanent)

Pour toute donnée personnelle : strict nécessaire, finalité précise, accès limités, durée de conservation définie, suppression ou anonymisation en fin de durée (sauf obligation légale), aucune réutilisation sans vérification, jamais « au cas où ». Ne jamais écrire que l'application est « conforme ». Tout nouveau traitement s'ajoute à `docs/rgpd/registre.md` ; tout nouveau prestataire à `docs/rgpd/sous-traitants.md`.

## Règles pour les versions futures (permanent)

Architecture détaillée : `docs/architecture-future.md`.

- **Agent IA d'achat** : agent opérationnel, pas un chatbot ; uniquement les données configurées pour l'entreprise. N'invente jamais références, caractéristiques, prix, disponibilités ou délais. Ne contacte que des fournisseurs pertinents, signale les manques et correspondances incertaines. E-mails professionnels, précis, selon les règles du client. **Ne passe jamais de commande ni n'accepte d'offre** sans autorisation explicite définie. Clés d'idempotence contre les doublons, reprise contrôlée après échec.
- **Boîtes e-mail** : OAuth via API officielles (Gmail, Microsoft Graph), jamais de mot de passe de messagerie. Moindre privilège, jetons chiffrés côté serveur, révocables, supprimés quand inutiles. Aucune lecture hors demandes d'achat, contenu des e-mails jamais journalisé. Envoi, suivi et récupération = trois services séparés. En développement : mode simulé ou boîte de test, aucun envoi réel sans configuration explicite. En production : limites d'envoi et règles de sélection par client.
- **IA et données** : vérifier conditions, conservation, sous-traitants et transferts hors UE avant tout fournisseur d'IA. Minimum de données (identifiants techniques), aucun entraînement sur les données clients sans base juridique et accord contractuel, flux documentés.
- **Traçabilité** : pour chaque opération importante, identifiant de demande, entreprise, action, horodatage, statut (en attente / en cours / terminé / échoué / intervention nécessaire), résultat ou motif d'échec, tentatives. « Envoyé » seulement après confirmation du service, « reçu » une fois récupéré, comparaison « fiable » seulement si données complètes et compatibles.
- **Coûts** : déterministe pour le simple, IA seulement où elle apporte une vraie valeur, pas d'appels en double, mesure de la consommation IA et messagerie par entreprise. Rien de « gratuit » ou « illimité » sans vérification. Pas d'infrastructure prématurée.

## Pièges connus

- Docker local : les registres d'images peuvent refuser le téléchargement (limite de débit). Si `npm run db:start` échoue, relancer plus tard ; les tests pgTAP sont alors signalés « non exécutés ».
- `cacheComponents` : une lecture de session hors `<Suspense>` casse le build. Voir `docs/DECISIONS.md` D-002.
- Les layouts et les pages se rendent en parallèle : un contrôle d'accès dans un layout ne protège pas la page. Chaque page et chaque action appelle son garde.

## Fin de phase et de session

Fin de phase : `/fin-phase` (ou à la main : `npm run check`, `npm run build`, `npm run test:db`, relecture de la porte de sortie, point de 5 lignes, commit). Fin de session : `/maj-docs` ou `/fin-session`. Une information = un fichier : un fait nouveau va dans le document qui porte déjà son sujet.
