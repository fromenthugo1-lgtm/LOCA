# Décisions techniques (ADR courts)

Chaque décision : contexte, choix, conséquence. On ajoute à la fin, on ne réécrit pas une décision : on la remplace par une nouvelle qui la cite.

## D-001 · Pile technique (2026-10-10)

**Contexte.** Dossier vide. Le cahier des charges fixe Next.js, TypeScript strict, Tailwind, shadcn/ui, Lucide, Supabase, Zod.
**Choix.** Next.js 16.4 (App Router), React 19, TypeScript 5 strict, Tailwind CSS 4, Supabase (Auth + Postgres 17), `@supabase/ssr`, Zod 4, Vitest 5, Playwright. Versions stables du jour.
**Conséquence.** Next.js 16 diffère de la documentation habituelle : le middleware s'appelle `proxy`, et le cache fonctionne par directives. La documentation de la version installée est dans `node_modules/next/dist/docs/` et fait foi.

## D-002 · Cache Components activé (2026-10-10)

**Contexte.** Next.js 16 propose `cacheComponents` (activé par défaut à la création, généralisé à la prochaine version majeure).
**Choix.** Le garder. Les contenus publics (textes, FAQ, formules, pages juridiques) sont lus par des fonctions `'use cache'` étiquetées (`cacheTag`) et invalidées par `updateTag` après une modification dans l'administration : le site se met à jour sans redéploiement. Les pages qui lisent la session le font sous `<Suspense>`.
**Conséquence.** Une lecture de cookies hors `<Suspense>` casse le build. Les layouts et pages se rendent en parallèle : chaque page et chaque action vérifie elle-même l'accès.

## D-003 · Composants à la manière de shadcn/ui, sans son registre (2026-10-10)

**Contexte.** Le cahier des charges demande shadcn/ui comme base technique accessible, entièrement restylée. Le registre en ligne de shadcn est inaccessible depuis l'environnement de développement (réseau filtré).
**Choix.** Appliquer la méthode shadcn : composants copiés dans `src/components/ui/`, posés sur les primitives Radix (`radix-ui`) quand un élément HTML natif ne suffit pas (dialogue, menu mobile), variantes avec `class-variance-authority`, fusion de classes avec `tailwind-merge`. Aucun style par défaut : tout vient des tokens de `DESIGN.md`.
**Conséquence.** Même résultat qu'avec la CLI shadcn, sans dépendance au registre. Un futur composant shadcn peut être ajouté avec `npx shadcn add` s'il est restylé.

## D-004 · Clés Supabase nouvelle génération (2026-10-10)

**Choix.** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (clé publique, `sb_publishable_…`) et `SUPABASE_SECRET_KEY` (clé secrète, `sb_secret_…`), qui remplacent `anon` et `service_role`. La clé secrète n'est importée que par `src/lib/supabase/admin.ts` (`import "server-only"`).
**Conséquence.** La clé secrète ne sert qu'à trois choses : enregistrer une demande de démo, appliquer les limites anti-abus, supprimer un compte d'authentification après anonymisation.

## D-005 · CSP sans nonce (2026-10-10)

**Contexte.** Une CSP à nonce impose un rendu dynamique de toutes les pages et désactive le pré-rendu (doc Next.js, « Content Security Policy »).
**Choix.** CSP déclarée dans `next.config.ts`, `script-src 'self' 'unsafe-inline'`, `connect-src` limité au site et à Supabase, `frame-ancestors 'none'`. Plus HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options.
**Conséquence.** Protection correcte sans sacrifier la vitesse. Durcissement possible plus tard (hachages SRI expérimentaux de Next.js).

## D-006 · Écritures admin : RLS + déclencheurs d'audit, statuts par fonctions (2026-10-10)

**Choix.** L'administration écrit avec la session du super_admin (la RLS s'applique, `private.is_super_admin()`), jamais avec la clé secrète. Chaque table administrée porte un déclencheur qui journalise l'écriture dans `audit_logs` (noms des colonnes modifiées, jamais les valeurs). Les colonnes protégées (statut de compte, CGU, suppression) ne sont modifiables que par des fonctions `SECURITY DEFINER` qui vérifient le rôle et journalisent. Les consultations sensibles (détail d'un compte, d'une demande de démo, export RGPD) sont journalisées aussi.
**Conséquence.** Journal fiable et atomique, impossible à contourner depuis l'interface. `audit_logs` n'a aucune politique de modification : même un admin ne peut pas l'effacer.

## D-007 · Demande de démo : fonction réservée au serveur (2026-10-10)

**Contexte.** Le cahier des charges demande une insertion publique via une fonction contrôlée.
**Choix.** `submit_demo_request` n'est exécutable que par la clé secrète, appelée par l'action serveur après validation Zod, champ piège, délai minimal de remplissage. La fonction impose en base trois limites : 3 demandes par heure et par IP hachée (HMAC avec `IP_HASH_SECRET`), 3 par jour et par e-mail, 200 par heure au total.
**Conséquence.** Le rôle anon n'a aucun accès aux demandes de démo, même en appelant l'API directement. Sans `SUPABASE_SECRET_KEY`, le formulaire affiche « enregistrement indisponible » au lieu de faire croire à un succès.

## D-008 · Cookies : aucun bandeau tant qu'aucun traceur optionnel n'existe (2026-10-10)

**Contexte.** La V1 n'utilise que des cookies strictement nécessaires (session, mémorisation du choix). La CNIL n'exige pas de consentement pour ceux-là.
**Choix.** Gestionnaire de consentement complet (finalités, boutons Accepter et Refuser de même importance, choix modifiable via « Gérer les cookies » en pied de page, `ConsentGate` pour charger un outil après accord). Le bandeau ne s'affiche que si une finalité optionnelle déclare un outil dans `src/config/cookies.ts`.
**Conséquence.** Pas de bandeau inutile aujourd'hui ; dès qu'un outil de mesure est ajouté, le bandeau apparaît sans autre développement.

## D-009 · Parcours d'e-mail d'authentification par `token_hash` (2026-10-10)

**Choix.** Les liens des e-mails (confirmation, réinitialisation, changement d'adresse) pointent vers `/auth/confirm?token_hash=…&type=…` et sont vérifiés côté serveur (`verifyOtp`). Modèles en français versionnés dans `supabase/templates/`.
**Conséquence.** Le lien fonctionne même ouvert sur un autre appareil que celui de l'inscription. Les modèles doivent être recopiés dans le tableau de bord Supabase en production (README).

## D-010 · Prix hors taxes, montants en centimes (2026-10-10)

**Choix.** Les formules stockent des centimes d'euro (entiers), `null` quand le montant n'est pas communiqué. Les prix affichés s'entendent HT (vente B2B), réglable dans `src/config/business.ts`.
**Conséquence.** Aucun arrondi flottant, aucun faux prix : sans montant, la carte affiche « sur devis ».

## D-011 · `/admin` répond « page introuvable » aux non-administrateurs (2026-10-10)

**Contexte.** `forbidden()` de Next.js est encore expérimental (`authInterrupts`).
**Choix.** `requireSuperAdmin()` renvoie `notFound()` : un utilisateur connecté non admin reçoit une 404, un visiteur non connecté est renvoyé vers la connexion par le proxy.
**Conséquence.** L'existence de l'administration n'est pas confirmée à un utilisateur standard.

## D-012 · Client Supabase serveur créé « au moment de la requête » (2026-10-10)

**Contexte.** Le client Supabase lit l'heure à sa création ; avec Cache Components, Next.js refuse une lecture de l'heure pendant un pré-rendu.
**Choix.** `createSupabaseServerClient()` appelle `await connection()` avant de lire les cookies.
**Conséquence.** Les pages connectées sont rendues à la demande (sous `<Suspense>`), le reste du site reste pré-rendu.

## D-013 · Limites de tentatives applicatives, refus si non configurées (2026-10-10)

**Choix.** En plus des limites intégrées à Supabase Auth : connexion 20 par IP et 8 par e-mail par 15 minutes, inscription 5 par IP par heure, réinitialisation 5 par IP et 3 par e-mail par heure (`src/features/auth/rate-limit.ts`). Sans clé secrète ou sans `IP_HASH_SECRET`, l'action refuse au lieu de passer sans contrôle. Pour « mot de passe oublié », une limite atteinte renvoie la même réponse qu'un succès (rien n'est révélé).
