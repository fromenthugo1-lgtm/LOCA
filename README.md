# SpendEdge

SpendEdge automatise les demandes de prix des professionnels auprès de leurs fournisseurs. Ce dépôt contient la **V1** :

- le site vitrine et la demande de démonstration ;
- les comptes, les entreprises et les rôles ;
- l'administration ;
- les fondations des abonnements et du RGPD.

L'agent IA d'achat n'en fait pas partie (voir `docs/ROADMAP.md`).

## Sommaire

1. [Technologies](#technologies)
2. [Organisation des dossiers](#organisation-des-dossiers)
3. [Lancer le projet sur votre ordinateur](#lancer-le-projet-sur-votre-ordinateur)
4. [Lancer les tests](#lancer-les-tests)
5. [Mettre en ligne](#mettre-en-ligne)
6. [Bloquant avant la mise en production](#bloquant-avant-la-mise-en-production)
7. [À faire par un humain](#à-faire-par-un-humain)
8. [Documents du projet](#documents-du-projet)

## Technologies

| Rôle | Outil |
| --- | --- |
| Site et serveur | Next.js 16 (App Router), React 19, TypeScript strict |
| Mise en forme | Tailwind CSS 4, composants maison sur Radix (méthode shadcn/ui), icônes Lucide |
| Comptes et base de données | Supabase (authentification et PostgreSQL), sécurité par RLS |
| Validation des formulaires | Zod (mêmes règles dans le navigateur et sur le serveur) |
| Tests | Vitest (unitaires), pgTAP (base de données), Playwright (parcours dans un navigateur) |
| Hébergement prévu | Vercel (site), Supabase en région Union européenne (base) |

## Organisation des dossiers

```
src/app/            Pages du site (une page = un dossier)
  (site)/           Site public : accueil, démo, tarifs, contact, pages juridiques
  (auth)/           Connexion, inscription, mot de passe oublié
  auth/confirm/     Page ouverte depuis les liens reçus par e-mail
  espace/           Espace client
  admin/            Administration (réservée au super_admin)
src/components/     Éléments d'interface (boutons, champs, sections, maquettes)
src/features/       Logique par domaine : formulaires, règles, accès aux données, actions
src/lib/            Supabase, variables d'environnement, sécurité
src/services/       Services externes remplaçables (e-mail, paiement)
src/config/         Navigation, routes, constantes métier, cookies
src/proxy.ts        Contrôle exécuté avant chaque page (session, accès)
supabase/           Migrations (schéma), tests pgTAP, modèles d'e-mails, configuration locale
tests/              Tests unitaires (unit/) et parcours (e2e/)
scripts/            Outils : création d'admin, .env.local, icônes, audit
docs/               Cahier des charges, feuille de route, décisions, paiements, RGPD
```

## Lancer le projet sur votre ordinateur

Comptez environ 20 minutes la première fois.

### Prérequis (une seule fois)

1. **Node.js LTS** (version 22 ou plus) : https://nodejs.org. Choisissez « LTS » et installez-le.
2. **Docker Desktop** : https://www.docker.com/products/docker-desktop. Gratuit pour un usage personnel ou une petite entreprise. Lancez-le, puis attendez que la baleine en haut de l'écran ne bouge plus. Docker fait tourner la base Supabase sur votre ordinateur.
3. **Git** (déjà présent sur Mac ; sur Windows : https://git-scm.com).

### Ouvrir un terminal dans le dossier du projet

- **Mac** : ouvrez l'application *Terminal*, tapez `cd ` (avec une espace), glissez le dossier du projet dans la fenêtre, puis appuyez sur Entrée.
- **Windows** : dans l'Explorateur, ouvrez le dossier du projet, cliquez dans la barre d'adresse, tapez `cmd` puis Entrée.

### Installer et démarrer

Tapez ces commandes une par une, en appuyant sur Entrée après chacune :

```bash
npm install
```
Télécharge les bibliothèques du projet (quelques minutes).

```bash
npm run db:start
```
Démarre Supabase en local (Docker doit être lancé). Le premier démarrage télécharge environ 2 Go. Si un message parle de « rate limit » ou de « Too Many Requests », attendez quelques minutes et relancez : les serveurs d'images limitent parfois les téléchargements.

```bash
npm run env:local
```
Crée le fichier `.env.local` avec les clés de la base locale. Ce fichier ne doit jamais être partagé ni envoyé sur GitHub ; il est ignoré par Git.

```bash
npm run db:reset
```
Crée toutes les tables et règles de sécurité dans la base locale.

```bash
npm run dev
```
Lance le site. Ouvrez http://localhost:3000 dans votre navigateur. Pour arrêter : `Ctrl + C` dans le terminal.

### Les e-mails en local

En local, aucun e-mail n'est vraiment envoyé : ils arrivent dans une boîte de test, à l'adresse http://127.0.0.1:54324. C'est là que vous trouverez le lien de confirmation après une inscription.

### Créer le premier administrateur (en local comme en production)

1. Inscrivez-vous normalement sur le site (`/inscription`), puis confirmez votre adresse.
2. Dans le terminal :
   ```bash
   npm run admin:create -- votre.adresse@exemple.fr
   ```
3. Connectez-vous, puis ouvrez `/admin`.

Cette opération exige la clé secrète : elle n'est volontairement pas possible depuis le site. En production, lancez-la depuis votre ordinateur avec les variables de production. Autre méthode : dans Supabase, *SQL Editor*, collez la requête suivante :
```sql
insert into public.platform_admins (user_id)
select id from auth.users where email = 'votre.adresse@exemple.fr';
```

### Variables d'environnement

Elles sont toutes décrites dans `.env.example` :

| Variable | Secrète | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Non | Adresse publique du site (liens, SEO) |
| `NEXT_PUBLIC_SUPABASE_URL` | Non | Adresse du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Non | Clé publique ; la sécurité repose sur la RLS |
| `SUPABASE_SECRET_KEY` | **Oui** | Contourne la RLS : uniquement côté serveur |
| `IP_HASH_SECRET` | **Oui** | Rend les adresses IP non réversibles (anti-abus) |

Si une variable manque, le site l'affiche clairement (« à configurer ») au lieu de faire semblant de fonctionner.

## Lancer les tests

| Commande | Ce qu'elle vérifie | Prérequis |
| --- | --- | --- |
| `npm run check` | Lint, types, tests unitaires, audit « ne fait pas IA » | Aucun |
| `npm run test:db` | Sécurité de la base : RLS partout, isolation entre deux entreprises, impossibilité de changer son propre rôle ou statut, accès admin refusé | Supabase local démarré |
| `npm run build` puis `npm run test:e2e` | Parcours réels dans un navigateur, sur ordinateur et sur mobile : démo, inscription, connexion, mot de passe, administration, accessibilité WCAG, liens, en-têtes | Supabase local + `.env.local` + `npx playwright install chromium` une fois |

Si Docker n'est pas installé, `npm run test:db` et `npm run test:e2e` ne peuvent pas tourner : c'est un test **non exécuté**, pas un test réussi.

Audit des dépendances : `npm audit --omit=dev` (dépendances du site en production) ne signale **aucune** vulnérabilité au 2026-10-10. `npm audit` complet signale 5 alertes dans l'outil de lint de Next.js (`eslint-config-next`, via `braces`), utilisé seulement en développement ; la correction proposée par npm rétrograderait Next.js. On attend une mise à jour officielle.

## Mettre en ligne

### 1. Créer le projet Supabase (production)

1. Créez un compte sur https://supabase.com (gratuit pour démarrer), puis cliquez sur *New project*.
2. **Région** : choisissez une région de l'Union européenne (*West EU (Paris)* de préférence). Elle ne peut plus être changée ensuite.
3. Notez le mot de passe de la base dans un gestionnaire de mots de passe.
4. *Project Settings > API Keys* : copiez l'URL, la clé publique (*publishable*) et la clé secrète (*secret*).
5. *Authentication > Sign In / Providers* : vérifiez que « Confirm email » est activé et que la longueur minimale du mot de passe est de 12 caractères, avec minuscules, majuscules et chiffres.
6. *Authentication > URL Configuration* : *Site URL* = l'adresse du site (par exemple `https://www.votre-domaine.fr`), et dans *Redirect URLs*, ajoutez `https://www.votre-domaine.fr/**`.
7. *Authentication > Email Templates* : pour « Confirm signup », « Reset password » et « Change email address », collez le contenu des fichiers `supabase/templates/confirmation.html`, `recovery.html` et `email_change.html`, avec les sujets indiqués dans `supabase/config.toml`.
8. Acceptez le DPA (accord de sous-traitance) dans les paramètres de l'organisation.

### 2. Appliquer le schéma de base

Dans le terminal, à la racine du projet :

```bash
npx supabase login
npx supabase link --project-ref VOTRE_REFERENCE_DE_PROJET
npx supabase db push
```

`db push` applique les migrations de `supabase/migrations/` : tables, règles de sécurité et purge planifiée. Il n'envoie pas les données de test locales. La référence du projet figure dans l'adresse du tableau de bord Supabase.

### 3. Déployer sur Vercel

1. Créez un compte sur https://vercel.com, puis *Add New > Project* et importez le dépôt GitHub.
2. *Environment Variables* : ajoutez les 5 variables du tableau ci-dessus (valeurs de production ; `IP_HASH_SECRET` est une nouvelle valeur générée).
3. Cliquez sur *Deploy*. Les fonctions serveur s'exécutent à Paris (`vercel.json`).

### 4. Domaine personnalisé

Achetez le domaine (chez un registrar), puis dans Vercel, *Settings > Domains*, ajoutez `votre-domaine.fr` et `www.votre-domaine.fr`. Choisissez la version principale (par exemple `www`) : l'autre redirigera automatiquement. Le HTTPS est automatique. Mettez ensuite à jour `NEXT_PUBLIC_SITE_URL` et l'URL du site dans Supabase.

### 5. Paiements

Rien n'est actif. Les étapes sont dans `docs/paiements.md`.

## Bloquant avant la mise en production

Ces champs `[À COMPLÉTER]` sont visibles sur le site. Ils se remplissent depuis `/admin/juridique` et `/admin/contenus` :

- **Mentions légales** : raison sociale, forme et capital, siège, SIREN/SIRET, immatriculation, TVA intracommunautaire, directeur de la publication, contact, hébergeurs du site et de la base.
- **Politique de confidentialité** : identité et coordonnées du responsable, e-mail dédié aux données personnelles, bases juridiques, liste des sous-traitants, transferts hors UE.
- **CGU** : disponibilité, responsabilité, droit applicable (texte à faire relire par un professionnel).
- **CGV** : à rédiger entièrement avant toute vente.
- **Coordonnées** (`/admin/contenus/site.contact`) : e-mail, téléphone, adresse, horaires.
- **Conseil juridique** dans `docs/rgpd/incidents.md`.

Les pages restent marquées « Document en cours de finalisation » tant qu'un champ `[À COMPLÉTER]` subsiste.

## À faire par un humain

- **Identité légale et coordonnées** : voir la liste ci-dessus.
- **Domaine** : acheter, brancher dans Vercel, mettre à jour `NEXT_PUBLIC_SITE_URL`.
- **SMTP dédié pour les e-mails d'authentification** : le service intégré de Supabase est plafonné et réservé aux tests. Choisissez un prestataire, de préférence européen, puis *Authentication > Emails > SMTP Settings*.
- **CAPTCHA Supabase Auth** (Cloudflare Turnstile) : protège l'inscription et la connexion contre les robots qui appellent l'API directement (`docs/DECISIONS.md`, D-014).
- **Double authentification** pour les comptes administrateurs.
- **DPA à accepter** (Supabase, Vercel) et transferts hors UE à vérifier : `docs/rgpd/sous-traitants.md`.
- **Durées de conservation à valider** : `docs/rgpd/conservation.md`.
- **Décisions juridiques** : `docs/rgpd/decisions-a-valider.md`.
- **Badges des fonctions sur l'accueil** : ils sont tous sur « En développement », « Prévu » ou « Vision ». Passez à « Disponible » ce qui l'est réellement, depuis `/admin/contenus`.
- **Formules et prix** : les saisir dans `/admin/formules` une fois décidés. Sans formule publiée, le site affiche « Tarification sur devis ».
- **Preuves à récupérer** : demander des avis après les premières mises en service, mesurer le temps gagné chez les premiers clients. Rien n'est affiché tant que ce n'est pas réel.
- **Photos** : vos vraies photos, si vous le souhaitez (aucune image générée ni de banque d'images).
- **Sauvegardes** : vérifier le plan Supabase et tester une restauration.

## Documents du projet

| Fichier | Contenu |
| --- | --- |
| `CLAUDE.md` | Règles permanentes et commandes (lu à chaque session de développement) |
| `DESIGN.md` | Identité visuelle « Midnight Precision » |
| `docs/SPEC.md` | Cahier des charges |
| `docs/ROADMAP.md` | État des phases et modules futurs (c'est le `docs/roadmap.md` demandé) |
| `docs/DECISIONS.md` | Décisions techniques |
| `docs/paiements.md` | Abonnements : ce qui est prêt, ce qui reste |
| `docs/architecture-future.md` | Comment la V1 prépare l'agent IA et les modules suivants |
| `docs/rgpd/` | Registre, sous-traitants, conservation, incidents, risques, décisions à valider |
| `JOURNAL.md` | Historique des sessions |
