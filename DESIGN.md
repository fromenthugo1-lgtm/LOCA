# DESIGN.md — Midnight Precision

**Direction.** Un logiciel d'achats B2B précis et sobre : beaucoup d'espace, une typographie nette, l'interface du produit montrée au premier plan. Références retenues par Hugo : Linear et Vercel (épure, hiérarchie typographique forte, maquettes d'interface plutôt qu'illustrations).

Ce fichier est la source de toute décision visuelle. Les tokens CSS (`src/app/globals.css`) en découlent. Un nouveau choix visuel s'ajoute ici **avant** d'être appliqué.

## Couleurs

| Token CSS | Valeur | Usage |
| --- | --- | --- |
| `--color-night` | #14243A | Identité, fonds sombres (pied de page, bandeau final, logo) |
| `--color-primary` | #3563E9 | Actions, liens, focus |
| `--color-primary-hover` | #2B54D4 | Survol des actions (dérivé, contraste 6,3:1) |
| `--color-ai` | #18B6A4 | Fonctions liées à l'IA : pastilles, icônes, traits. **Jamais en texte sur fond clair** (2,5:1) |
| `--color-ai-ink` | #0F766E | Texte « IA » sur fond clair (dérivé, 5,5:1) |
| `--color-canvas` | #F7F9FC | Fond des pages |
| `--color-surface` | #FFFFFF | Cartes, panneaux |
| `--color-ink` | #0F172A | Corps et titres |
| `--color-muted` | #64748B | Libellés, aides (4,5:1 sur le fond) |
| `--color-line` | #E2E8F0 | Bordures, séparateurs |
| `--color-success` | #16A34A | Icône de statut positif |
| `--color-success-ink` | #15803D | Texte de statut positif (5,0:1) |
| `--color-warning` | #F59E0B | Icône de statut à surveiller |
| `--color-warning-ink` | #B45309 | Texte de statut à surveiller (5,0:1) |
| `--color-danger` | #DC2626 | Statut bloquant, erreurs (4,8:1) |
| `--color-night-muted` | #94A3B8 | Texte secondaire sur fond bleu nuit (6,1:1) |

Règles :
- Un statut s'affiche toujours avec **icône + libellé**, jamais par la seule couleur.
- Les couleurs d'origine du cahier des charges (succès, avertissement, turquoise) servent aux icônes et pastilles ; leurs variantes `-ink` servent au texte, pour tenir le contraste WCAG AA.
- Aucun dégradé. Aucun violet, aucun rose.

## Typographie

Police unique : **Inter** (chargée par `next/font`, auto-hébergée, aucun appel à Google au chargement de la page).

| Rôle | Taille | Graisse |
| --- | --- | --- |
| Titre hero (vitrine) | 44-60 px, interlignage 1,05, approche -0,02 em | 600 |
| Titre de section vitrine | 30-36 px | 600 |
| Titre de page applicative | 26-30 px | 600 |
| Titre de bloc | 18-20 px | 600 |
| Corps | 14-16 px, interlignage 1,6 | 400 |
| Texte secondaire | 12-14 px | 400 |
| Bouton | 14 px | 500 |
| Sur-titre (eyebrow) | 13 px, chiffres tabulaires | 500 |

Chiffres tabulaires (`tabular-nums`) dans les tableaux, prix et maquettes.

## Forme et espace

- **Un seul rayon : 8 px** (`--radius`), pour tout : cartes, boutons, champs, badges, images, maquettes. Jamais de bouton en pilule.
- Grille de **8 px** : tous les espacements sont des multiples de 4/8 px (échelle Tailwind par défaut).
- Bordure 1 px `--color-line`. Ombres : aucune par défaut ; une seule ombre autorisée, `--shadow-panel` (`0 1px 2px rgb(15 23 42 / 0.06)`), pour les panneaux de maquette posés sur le fond.
- Largeur de contenu : 1200 px max, gouttières de 24 px (16 px sur mobile).
- Signature visuelle « précision » : fines lignes de repère (1 px, `--color-line`) qui cadrent les sections, à la manière d'un plan technique. Pas d'autre ornement.

## Composants et états

Chaque composant interactif définit : repos, survol, focus (anneau 2 px `--color-primary`, décalé de 2 px), actif, chargement (texte « Envoi… » + icône `Loader2` qui tourne, bouton désactivé), erreur (bordure et message `--color-danger` + icône `CircleAlert`), désactivé (opacité 50 %, curseur interdit).

Boutons : principal (fond `--color-primary`, texte blanc), secondaire (fond blanc, bordure `--color-line`, texte `--color-ink`), discret (texte seul). Hauteur 40 px (44 px sur mobile pour la cible tactile).

Badges de disponibilité, utilisés partout où une fonction est décrite :
- **Disponible** : icône `CircleCheck`, texte `--color-success-ink`.
- **En développement** : icône `CircleDashed`, texte `--color-warning-ink`.
- **Vision** / **Prévu** : icône `Telescope`, texte `--color-muted`.

Les composants suivent la méthode shadcn/ui : code copié dans le dépôt (`src/components/ui/`), posé sur les primitives accessibles Radix quand un élément HTML natif ne suffit pas (fenêtre de dialogue, menu mobile), et **entièrement restylé** avec ces tokens (voir docs/DECISIONS.md, D-003). Aucun style par défaut d'une bibliothèque n'est visible.

## Icônes

**Lucide uniquement**, taille 16 px dans le texte et les boutons, 20 px dans les cartes, trait 1,75 partout (`strokeWidth={1.75}`). Aucun emoji dans l'interface.

## Mouvement

Autorisé :
- Apparition douce : fondu + décalage de 8 px, 240 ms, `cubic-bezier(0.2, 0, 0, 1)`.
- Survol et clic : changement de couleur ou de bordure en 150 ms.
- La démonstration au défilement (accueil) : changement de panneau en fondu 240 ms. **Seule animation liée au défilement.**

Interdit : parallaxe, rebonds, curseur personnalisé, zoom au survol, chargements artificiels, compteurs animés.

`prefers-reduced-motion: reduce` : toutes les transitions passent à un fondu de 0 ms (aucun déplacement).

## Logo

Symbole : deux colonnes de points (acheteur à gauche, fournisseurs à droite) reliées par un trait unique qui aboutit sur une arête nette, comme une mesure. Il dit « rapprocher un besoin du bon fournisseur, avec précision ». SVG pur, sans dégradé. Mot « SpendEdge » en Inter 600, approche -0,01 em.

Variantes (`src/components/brand/logo.tsx`) : complète (navigation), symbole seul (favicon, icônes), claire (sur bleu nuit).

## Images

Pas de photo. Le visuel principal est **l'interface de SpendEdge elle-même**, sous forme de maquettes codées en HTML (nettes à toutes les tailles, traduisibles, accessibles), toujours étiquetées « Aperçu, données fictives ». Les vraies photos d'Hugo pourront s'ajouter plus tard (`next/image`, AVIF/WebP).

## Ton des textes

- Vouvoiement, phrases courtes, verbes concrets. On dit ce que fait SpendEdge, pour qui, et ce que le visiteur y gagne.
- Interdits : « Transformez votre business », « Libérez votre potentiel », « La solution tout-en-un », « Boostez… », « révolutionnaire », les tirets longs (—) et demi-cadratins (–) comme ponctuation, les listes de trois adjectifs, le texte de remplissage.
- Aucun chiffre, avis, logo client ou témoignage tant qu'Hugo n'a rien fourni de réel.
- Une fonction future est toujours marquée « En développement », « Prévu » ou « Vision ».
