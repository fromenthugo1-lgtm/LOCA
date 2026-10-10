# Rapport final : SpendEdge V1

Établi le 2026-10-10, sur la branche `claude/new-session-cieoq4`. Ce rapport est un instantané : l'état vivant est dans `docs/ROADMAP.md`, les décisions dans `docs/DECISIONS.md`.

Légende : **fonctionne** (testé de bout en bout), **préparé** (structure en place, rien d'actif), **simulé** (données de démonstration), **à configurer** (dépend d'un réglage ou d'un compte externe).

## 1. Pages créées

| Zone | Pages | État |
| --- | --- | --- |
| Site public | `/` (accueil), `/demo`, `/tarifs`, `/contact`, `/mentions-legales`, `/confidentialite`, `/cgu`, `/cgv`, page 404 | Fonctionne (pages juridiques : trames `[À COMPLÉTER]`) |
| Authentification | `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`, `/verifier-email`, `/auth/confirm` | Fonctionne |
| Espace client | `/espace` (état du compte, CGU, entreprise, abonnement, demande de suppression) | Fonctionne |
| Administration | `/admin` (vue d'ensemble), `/admin/demandes`, `/admin/comptes`, `/admin/entreprises`, `/admin/formules`, `/admin/contenus`, `/admin/faq`, `/admin/juridique`, `/admin/rgpd`, `/admin/journal` et leurs fiches | Fonctionne |
| SEO | `sitemap.xml`, `robots.txt`, image de partage 1200 × 630, favicon (16, 32, 48), icône Apple, manifeste | Fonctionne |

## 2. Fonctionnalités

| Fonctionnalité | État |
| --- | --- |
| Accueil complet, démonstration au défilement (version empilée sur mobile, mouvement réduit respecté) | Fonctionne ; maquettes **simulées**, étiquetées « Aperçu, données fictives » |
| Demande de démo enregistrée en base, validation identique navigateur et serveur, champ piège, jeton horodaté signé, limites par IP hachée, par e-mail et globale | Fonctionne |
| E-mail de confirmation de demande de démo | Préparé (interface d'envoi désactivée, rien n'est annoncé au visiteur) |
| Inscription, confirmation d'adresse, connexion, déconnexion, mot de passe oublié et réinitialisation | Fonctionne (en local) ; **à configurer** en production (projet Supabase, SMTP) |
| États de compte (à confirmer, créé, mise en service en attente, actif, suspendu), lus en base | Fonctionne |
| Entreprises, membres, rôles `member` / `company_admin`, `super_admin` | Fonctionne |
| Administration : démos, comptes, entreprises, formules, contenus, FAQ, pages juridiques versionnées, RGPD, journal d'audit | Fonctionne |
| Modification des textes, de la FAQ, des formules et des pages juridiques sans redéploiement | Fonctionne (testé : publication puis affichage immédiat sur le site) |
| Formules et tarifs (« sur devis » sans formule publiée) | Fonctionne ; aucun prix saisi |
| Abonnements, événements de paiement, droit d'accès calculé en base | Préparé (aucune transaction possible) |
| Gestionnaire de cookies (finalités, Accepter et Refuser de même poids, « Gérer les cookies ») | Fonctionne ; aucun bandeau car aucun traceur (D-008) |
| Droits RGPD : demandes, échéance d'un mois, export JSON, suppression en deux temps, purge planifiée | Fonctionne (purge : **à vérifier** en production) |
| Modules futurs (abonnements, statistiques, fournisseurs…) | Emplacement « Bientôt » seulement |

## 3. Technologies

Next.js 16.4 (App Router, Cache Components), React 19, TypeScript strict, Tailwind CSS 4, Radix (méthode shadcn/ui, entièrement restylé), Lucide, Supabase (Auth, PostgreSQL 17), Zod 4, Vitest 5, pgTAP, Playwright et axe-core. Hébergement prévu : Vercel (fonctions à Paris) et Supabase en région UE.

## 4. Tables

`profiles`, `platform_admins`, `companies`, `company_members`, `company_internal_notes`, `plans`, `subscriptions`, `billing_events`, `site_content`, `faq_items`, `legal_pages`, `legal_page_versions`, `demo_requests`, `rate_limit_events`, `gdpr_requests`, `audit_logs`. Six migrations dans `supabase/migrations/`.

## 5. Mesures de sécurité

- RLS sur toutes les tables (vérifié par test), droits révoqués par défaut puis accordés colonne par colonne.
- Fonctions `SECURITY DEFINER` avec `search_path` vide (vérifié par test).
- Rôles et statuts impossibles à modifier par l'utilisateur : droits de colonne et déclencheur de garde.
- Isolation par entreprise (membre, compte actif, entreprise active).
- `super_admin` vérifié en base à chaque requête ; un admin suspendu perd ses droits ; un admin ne peut ni destituer ni supprimer un autre admin.
- `/admin` filtré dès le proxy (vraie 404 pour un non-admin), puis revérifié dans chaque page et chaque action.
- Clé secrète uniquement côté serveur, pour des usages limités.
- Limites de tentatives (connexion, inscription, réinitialisation, démo) ; adresses IP et e-mails stockés uniquement en empreintes HMAC.
- Redirections internes analysées (redirection ouverte corrigée) ; liens d'e-mail validés par un bouton (POST).
- Journal d'audit non modifiable, consultations sensibles journalisées.
- En-têtes CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, nosniff ; `X-Powered-By` désactivé.
- Deux relectures indépendantes (agents `relecteur-securite` et `relecteur-de-phase`), constats vérifiés à la source et corrigés (D-014, D-015).

## 6. Tests exécutés (résultats réels, base remise à zéro)

| Contrôle | Commande | Résultat |
| --- | --- | --- |
| Lint, types, unitaires, audit « ne fait pas IA » | `npm run check` | 52 tests unitaires réussis, 0 erreur, aucun motif interdit |
| Base de données (pgTAP) | `npm run test:db` | 73 tests réussis sur 6 fichiers |
| Build de production | `npm run build` | Réussi, 43 pages générées |
| Parcours navigateur, ordinateur et mobile | `npm run test:e2e` | 74 réussis, 4 ignorés volontairement (tests clavier sur ordinateur seulement, menu mobile sur mobile seulement) |
| Contrôle du projet | `/verifier` | Tout passe |
| Dépendances de production | `npm audit --omit=dev` | 0 vulnérabilité ; 5 alertes dans un outil de développement (voir README) |

Les parcours couvrent :

- la démo : succès réellement enregistré, erreurs par champ, anti-robot, limite ;
- l'inscription, avec un vrai e-mail reçu et un vrai lien ;
- la connexion, le mot de passe oublié, les états de compte ;
- les pages privées sans session, `/admin` refusé à un non-admin ;
- l'administration : démos, formules visibles sur `/tarifs`, textes publiés, entreprise, statut, isolation, RGPD avec export ;
- l'accessibilité WCAG 2.1 AA par axe sur 28 pages, une seule h1, l'absence de débordement mobile ;
- le clavier, le menu mobile, les cookies, les animations réduites ;
- les liens internes, le sitemap, les icônes, les en-têtes.

## 7. Services externes à configurer

Projet Supabase (région UE), Vercel, domaine, SMTP dédié, CAPTCHA Supabase Auth (Turnstile), double authentification des admins. Plus tard : Stripe, fournisseur d'IA, API Gmail et Microsoft. Les étapes sont dans `README.md` et `docs/paiements.md`.

## 8. Non développé (hors V1, l'architecture le permet)

Agent IA d'achat, connexion des boîtes e-mail, réception automatique des réponses, comparaison des offres, modules fournisseurs, produits et demandes d'achat, paiement en ligne, statistiques, affiliation, codes promo, campagnes, connexion Google / Microsoft. Le détail est dans `docs/ROADMAP.md` et `docs/architecture-future.md`.

## 9. Problèmes restants

- **Contournement des limites de connexion** par un appel direct à l'API Supabase Auth : mitigé par les limites de Supabase ; le CAPTCHA reste à activer (D-014).
- **CSP** avec `'unsafe-inline'` pour les scripts : un nonce imposerait un rendu dynamique de tout le site (D-005).
- **Le formulaire de démo exige JavaScript** (jeton horodaté signé).
- **Purge planifiée** : testée en local, à vérifier en production (`docs/rgpd/conservation.md`).
- **Journal d'audit** sans purge (durée à décider).
- **Outil de lint** (développement) : 5 alertes en attente d'une mise à jour officielle.

## 10. Points RGPD à valider avant lancement

Voir `docs/rgpd/decisions-a-valider.md`. En résumé :

- identité légale et coordonnées dans les mentions légales et la confidentialité ;
- bases juridiques ;
- durées de conservation ;
- DPA Supabase et Vercel, et transferts hors UE ;
- rédaction des CGU et des CGV ;
- contrat de sous-traitance pour les futurs modules ;
- AIPD avant l'agent IA et l'accès aux boîtes e-mail.

## 11. Commandes pour lancer le projet

```bash
npm install
npm run db:start
npm run env:local
npm run db:reset
npm run dev
```

Puis http://localhost:3000 ; e-mails de test sur http://127.0.0.1:54324 ; premier admin : `npm run admin:create -- votre@adresse.fr`.

## 12. Identité visuelle

Le `DESIGN.md` final est à la racine du dépôt : « Midnight Precision », références Linear et Vercel. Les valeurs de la palette ont été conservées ; trois variantes de texte ont été ajoutées (`-ink`) pour tenir le contraste WCAG AA. Le rayon d'arrondi est unique (8 px), les icônes viennent toutes de Lucide, sans dégradé ni photo.

## 13. Textes principaux : avant / après

Aucun texte fourni par Hugo n'a été remplacé.

| Élément | Texte d'Hugo (en ligne) | Proposition, **non appliquée**, à valider |
| --- | --- | --- |
| Titre du hero | « Vos demandes de prix fournisseurs, automatisées par l'IA. » | Inchangé : il se comprend en trois secondes. |
| Sous-titre du hero | « SpendEdge aide les entreprises à consulter leurs fournisseurs plus simplement, à gagner du temps sur leurs achats et à comparer les propositions reçues. » | « Décrivez votre besoin une fois : SpendEdge consulte vos fournisseurs et rassemble leurs réponses pour que vous compariez. » (plus concret, sans la suite de trois verbes) |
| Bouton principal | « Demander une démonstration » | Inchangé |
| Bouton secondaire | « Découvrir le fonctionnement » | Inchangé |
| Appel à l'action final | « Et si vous passiez moins de temps à consulter vos fournisseurs ? » | Inchangé |

Pour appliquer la proposition : `/admin/contenus/home.hero`.

## 14. À faire par un humain

La liste complète, avec les étapes, est dans `README.md`, section « À faire par un humain ». En bref :

- informations légales ;
- domaine ;
- SMTP ;
- CAPTCHA ;
- double authentification des admins ;
- DPA et transferts ;
- durées de conservation ;
- badges « Disponible » à ajuster selon la réalité ;
- formules et prix ;
- avis et chiffres à recueillir auprès des premiers clients ;
- photos éventuelles ;
- test de restauration des sauvegardes.

## 15. Points jugés non applicables

| Point | Raison |
| --- | --- |
| Section témoignages ou logos clients | Aucune preuve réelle fournie (SPEC §7 bis.3) |
| Bandeau de cookies affiché | Aucun traceur non essentiel installé ; le gestionnaire est prêt et s'affichera dès qu'un outil sera déclaré (D-008) |
| Photos | Aucune photo réelle fournie ; aucune image générée ni de banque d'images |
| Connexion Google / Microsoft | Non requise en V1, Supabase Auth le permettra |
| Questions préalables autres que les sites de référence | Déjà tranchées par le cahier des charges |
| Redirection www / sans www | Dépend du domaine, à régler dans Vercel au branchement (README) |
| `/code-review` facturé | Non lancé : c'est une dépense. Il est proposé ci-dessous pour une relecture ciblée des migrations de sécurité avant la production. |

## 16. Fichiers du dépôt (une ligne par fichier, hors `package-lock.json`)

- `.env.example` : Configuration du projet
- `.gitignore` : Configuration du projet
- `CLAUDE.md` : Documentation
- `DESIGN.md` : Documentation
- `JOURNAL.md` : Documentation
- `README.md` : Documentation
- `docs/DECISIONS.md` : Documentation
- `docs/RAPPORT-V1.md` : Documentation
- `docs/ROADMAP.md` : Documentation
- `docs/SPEC.md` : Documentation
- `docs/architecture-future.md` : Documentation
- `docs/paiements.md` : Documentation
- `docs/rgpd/analyse-risques.md` : Document RGPD
- `docs/rgpd/conservation.md` : Document RGPD
- `docs/rgpd/decisions-a-valider.md` : Document RGPD
- `docs/rgpd/incidents.md` : Document RGPD
- `docs/rgpd/registre.md` : Document RGPD
- `docs/rgpd/sous-traitants.md` : Document RGPD
- `eslint.config.mjs` : Configuration du projet
- `next.config.ts` : Configuration du projet
- `package.json` : Configuration du projet
- `playwright.config.ts` : Configuration du projet
- `public/icon-192.png` : Fichier public (icône)
- `public/icon-512.png` : Fichier public (icône)
- `public/select-chevron.svg` : Fichier public (icône)
- `scripts/audit-ai.mjs` : Script utilitaire
- `scripts/create-admin.mjs` : Script utilitaire
- `scripts/generate-icons.mjs` : Script utilitaire
- `scripts/setup-local-env.mjs` : Script utilitaire
- `src/app/(auth)/connexion/page.tsx` : Page d'authentification
- `src/app/(auth)/inscription/page.tsx` : Page d'authentification
- `src/app/(auth)/layout.tsx` : Mise en page commune
- `src/app/(auth)/mot-de-passe-oublie/page.tsx` : Page d'authentification
- `src/app/(auth)/reinitialiser-mot-de-passe/page.tsx` : Page d'authentification
- `src/app/(auth)/verifier-email/page.tsx` : Page d'authentification
- `src/app/(site)/cgu/page.tsx` : Page publique
- `src/app/(site)/cgv/page.tsx` : Page publique
- `src/app/(site)/confidentialite/page.tsx` : Page publique
- `src/app/(site)/contact/page.tsx` : Page publique
- `src/app/(site)/demo/page.tsx` : Page publique
- `src/app/(site)/layout.tsx` : Mise en page commune
- `src/app/(site)/mentions-legales/page.tsx` : Page publique
- `src/app/(site)/page.tsx` : Page publique
- `src/app/(site)/tarifs/page.tsx` : Page publique
- `src/app/admin/comptes/[id]/page.tsx` : Page d'administration
- `src/app/admin/comptes/page.tsx` : Page d'administration
- `src/app/admin/contenus/[key]/page.tsx` : Page d'administration
- `src/app/admin/contenus/page.tsx` : Page d'administration
- `src/app/admin/demandes/[id]/page.tsx` : Page d'administration
- `src/app/admin/demandes/page.tsx` : Page d'administration
- `src/app/admin/entreprises/[id]/page.tsx` : Page d'administration
- `src/app/admin/entreprises/nouvelle/page.tsx` : Page d'administration
- `src/app/admin/entreprises/page.tsx` : Page d'administration
- `src/app/admin/faq/page.tsx` : Page d'administration
- `src/app/admin/formules/[id]/page.tsx` : Page d'administration
- `src/app/admin/formules/nouvelle/page.tsx` : Page d'administration
- `src/app/admin/formules/page.tsx` : Page d'administration
- `src/app/admin/journal/page.tsx` : Page d'administration
- `src/app/admin/juridique/[slug]/page.tsx` : Page d'administration
- `src/app/admin/juridique/page.tsx` : Page d'administration
- `src/app/admin/layout.tsx` : Mise en page commune
- `src/app/admin/page.tsx` : Page d'administration
- `src/app/admin/rgpd/[id]/page.tsx` : Page d'administration
- `src/app/admin/rgpd/page.tsx` : Page d'administration
- `src/app/apple-icon.png` : Icône du site
- `src/app/auth/confirm/page.tsx` : Validation des liens reçus par e-mail
- `src/app/error.tsx` : Page d'erreur
- `src/app/espace/layout.tsx` : Espace client
- `src/app/espace/page.tsx` : Espace client
- `src/app/favicon.ico` : Icône du site
- `src/app/globals.css` : Design tokens et styles de base
- `src/app/icon.svg` : Icône du site
- `src/app/layout.tsx` : Mise en page commune
- `src/app/manifest.ts` : SEO (sitemap, robots, manifeste, image de partage)
- `src/app/not-found.tsx` : Page d'erreur
- `src/app/opengraph-image.tsx` : SEO (sitemap, robots, manifeste, image de partage)
- `src/app/robots.ts` : SEO (sitemap, robots, manifeste, image de partage)
- `src/app/sitemap.ts` : SEO (sitemap, robots, manifeste, image de partage)
- `src/components/admin/action-form.tsx` : Composant de l'administration
- `src/components/admin/admin-sidebar.tsx` : Composant de l'administration
- `src/components/admin/company-fields.tsx` : Composant de l'administration
- `src/components/admin/content-fields.tsx` : Composant de l'administration
- `src/components/admin/export-form.tsx` : Composant de l'administration
- `src/components/admin/page-suspense.tsx` : Composant de l'administration
- `src/components/admin/plan-fields.tsx` : Composant de l'administration
- `src/components/admin/ui.tsx` : Composant de l'administration
- `src/components/app/app-header.tsx` : Composant
- `src/components/brand/logo.tsx` : Composant
- `src/components/consent/consent-provider.tsx` : Composant
- `src/components/consent/manage-cookies-button.tsx` : Composant
- `src/components/forms/auth-card.tsx` : Formulaire
- `src/components/forms/auth-forms.tsx` : Formulaire
- `src/components/forms/demo-request-form.tsx` : Formulaire
- `src/components/forms/password-input.tsx` : Formulaire
- `src/components/forms/submit-button.tsx` : Formulaire
- `src/components/layout/container.tsx` : Composant
- `src/components/layout/mobile-nav.tsx` : Composant
- `src/components/layout/section-heading.tsx` : Composant
- `src/components/layout/site-footer.tsx` : Composant
- `src/components/layout/site-header.tsx` : Composant
- `src/components/legal/legal-page-view.tsx` : Composant
- `src/components/legal/rich-text.tsx` : Composant
- `src/components/marketing/faq.tsx` : Section du site vitrine
- `src/components/marketing/features.tsx` : Section du site vitrine
- `src/components/marketing/final-cta.tsx` : Section du site vitrine
- `src/components/marketing/hero.tsx` : Section du site vitrine
- `src/components/marketing/mockups/app-frame.tsx` : Maquette d'interface (données fictives)
- `src/components/marketing/mockups/fictional-data.ts` : Maquette d'interface (données fictives)
- `src/components/marketing/mockups/request-overview.tsx` : Maquette d'interface (données fictives)
- `src/components/marketing/mockups/status-pill.tsx` : Maquette d'interface (données fictives)
- `src/components/marketing/mockups/walkthrough-panels.tsx` : Maquette d'interface (données fictives)
- `src/components/marketing/onboarding.tsx` : Section du site vitrine
- `src/components/marketing/plan-card.tsx` : Section du site vitrine
- `src/components/marketing/pricing.tsx` : Section du site vitrine
- `src/components/marketing/problem.tsx` : Section du site vitrine
- `src/components/marketing/scroll-walkthrough.tsx` : Section du site vitrine
- `src/components/marketing/sectors.tsx` : Section du site vitrine
- `src/components/marketing/solution.tsx` : Section du site vitrine
- `src/components/marketing/walkthrough.tsx` : Section du site vitrine
- `src/components/seo/json-ld.tsx` : Composant
- `src/components/ui/badge.tsx` : Composant d'interface de base
- `src/components/ui/button.tsx` : Composant d'interface de base
- `src/components/ui/card.tsx` : Composant d'interface de base
- `src/components/ui/dialog.tsx` : Composant d'interface de base
- `src/components/ui/field.tsx` : Composant d'interface de base
- `src/components/ui/notice.tsx` : Composant d'interface de base
- `src/components/ui/skeleton.tsx` : Composant d'interface de base
- `src/config/admin-nav.ts` : Configuration centralisée
- `src/config/business.ts` : Configuration centralisée
- `src/config/cookies.ts` : Configuration centralisée
- `src/config/routes.ts` : Configuration centralisée
- `src/config/site.ts` : Configuration centralisée
- `src/features/admin/accounts/actions.ts` : Administration : données et actions serveur
- `src/features/admin/accounts/queries.ts` : Administration : données et actions serveur
- `src/features/admin/action-state.ts` : Administration : données et actions serveur
- `src/features/admin/client.ts` : Administration : données et actions serveur
- `src/features/admin/companies/actions.ts` : Administration : données et actions serveur
- `src/features/admin/companies/queries.ts` : Administration : données et actions serveur
- `src/features/admin/content/actions.ts` : Administration : données et actions serveur
- `src/features/admin/content/queries.ts` : Administration : données et actions serveur
- `src/features/admin/demo-requests/actions.ts` : Administration : données et actions serveur
- `src/features/admin/demo-requests/queries.ts` : Administration : données et actions serveur
- `src/features/admin/faq/actions.ts` : Administration : données et actions serveur
- `src/features/admin/faq/queries.ts` : Administration : données et actions serveur
- `src/features/admin/gdpr/actions.ts` : Administration : données et actions serveur
- `src/features/admin/gdpr/queries.ts` : Administration : données et actions serveur
- `src/features/admin/labels.ts` : Administration : données et actions serveur
- `src/features/admin/legal/actions.ts` : Administration : données et actions serveur
- `src/features/admin/legal/queries.ts` : Administration : données et actions serveur
- `src/features/admin/overview.ts` : Administration : données et actions serveur
- `src/features/admin/plans/actions.ts` : Administration : données et actions serveur
- `src/features/admin/plans/queries.ts` : Administration : données et actions serveur
- `src/features/auth/account-view.ts` : Authentification : règles, session, gardes, actions
- `src/features/auth/actions.ts` : Authentification : règles, session, gardes, actions
- `src/features/auth/guards.ts` : Authentification : règles, session, gardes, actions
- `src/features/auth/rate-limit.ts` : Authentification : règles, session, gardes, actions
- `src/features/auth/schema.ts` : Authentification : règles, session, gardes, actions
- `src/features/auth/session.ts` : Authentification : règles, session, gardes, actions
- `src/features/billing/queries.ts` : Logique métier par domaine
- `src/features/consent/consent.ts` : Logique métier par domaine
- `src/features/demo-requests/actions.ts` : Logique métier par domaine
- `src/features/demo-requests/form-token.ts` : Logique métier par domaine
- `src/features/demo-requests/schema.ts` : Logique métier par domaine
- `src/features/faq/defaults.ts` : Logique métier par domaine
- `src/features/faq/queries.ts` : Logique métier par domaine
- `src/features/legal/defaults.ts` : Logique métier par domaine
- `src/features/legal/queries.ts` : Logique métier par domaine
- `src/features/plans/queries.ts` : Logique métier par domaine
- `src/features/plans/schema.ts` : Logique métier par domaine
- `src/features/site-content/defaults.ts` : Logique métier par domaine
- `src/features/site-content/form-data.ts` : Logique métier par domaine
- `src/features/site-content/labels.ts` : Logique métier par domaine
- `src/features/site-content/queries.ts` : Logique métier par domaine
- `src/features/site-content/schemas.ts` : Logique métier par domaine
- `src/lib/cache/tags.ts` : Utilitaires (configuration, sécurité, cache)
- `src/lib/env.server.ts` : Utilitaires (configuration, sécurité, cache)
- `src/lib/env.ts` : Utilitaires (configuration, sécurité, cache)
- `src/lib/security/ip.ts` : Utilitaires (configuration, sécurité, cache)
- `src/lib/supabase/admin.ts` : Clients Supabase
- `src/lib/supabase/database.types.ts` : Types générés depuis la base
- `src/lib/supabase/public.ts` : Clients Supabase
- `src/lib/supabase/server.ts` : Clients Supabase
- `src/lib/utils.ts` : Utilitaires (configuration, sécurité, cache)
- `src/proxy.ts` : Proxy : session, pages privées, administration
- `src/services/email/index.ts` : Interface de service externe
- `src/services/email/types.ts` : Interface de service externe
- `src/services/payments/types.ts` : Interface de service externe
- `supabase/.gitignore` : Configuration Supabase
- `supabase/config.toml` : Configuration Supabase
- `supabase/migrations/20261010000100_foundations.sql` : Migration de base de données
- `supabase/migrations/20261010000200_public_content_and_plans.sql` : Migration de base de données
- `supabase/migrations/20261010000300_demo_requests_and_rate_limits.sql` : Migration de base de données
- `supabase/migrations/20261010000400_billing_and_gdpr.sql` : Migration de base de données
- `supabase/migrations/20261010000500_security_hardening.sql` : Migration de base de données
- `supabase/migrations/20261010000600_phase_review_fixes.sql` : Migration de base de données
- `supabase/templates/confirmation.html` : Modèle d'e-mail en français
- `supabase/templates/email_change.html` : Modèle d'e-mail en français
- `supabase/templates/recovery.html` : Modèle d'e-mail en français
- `supabase/tests/01_rls_everywhere.test.sql` : Test pgTAP de la base
- `supabase/tests/02_company_isolation.test.sql` : Test pgTAP de la base
- `supabase/tests/03_privilege_escalation.test.sql` : Test pgTAP de la base
- `supabase/tests/04_public_content_and_demo.test.sql` : Test pgTAP de la base
- `supabase/tests/05_hardening.test.sql` : Test pgTAP de la base
- `supabase/tests/06_account_deletion_and_subscription.test.sql` : Test pgTAP de la base
- `tests/e2e/accessibility.spec.ts` : Test de parcours Playwright
- `tests/e2e/admin.spec.ts` : Test de parcours Playwright
- `tests/e2e/auth.spec.ts` : Test de parcours Playwright
- `tests/e2e/demo-request.spec.ts` : Test de parcours Playwright
- `tests/e2e/helpers.ts` : Test de parcours Playwright
- `tests/e2e/links.spec.ts` : Test de parcours Playwright
- `tests/support/server-only.ts` : Support de test
- `tests/unit/account-view.test.ts` : Test unitaire
- `tests/unit/consent.test.ts` : Test unitaire
- `tests/unit/content-form.test.ts` : Test unitaire
- `tests/unit/demo-request.test.ts` : Test unitaire
- `tests/unit/plans.test.ts` : Test unitaire
- `tests/unit/routes.test.ts` : Test unitaire
- `tests/unit/site-content.test.ts` : Test unitaire
- `tsconfig.json` : Configuration du projet
- `vercel.json` : Configuration du projet
- `vitest.config.mts` : Configuration du projet
