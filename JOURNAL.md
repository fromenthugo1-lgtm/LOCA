# Journal

Ce qui s'est passé, daté. On ajoute à la fin.

## 2026-10-10 · Session 1

- Prompt maître reçu, conservé dans `docs/SPEC.md`. Référence visuelle choisie par Hugo : Linear / Vercel.
- Projet Next.js 16.4 créé ; Supabase local démarré sous Docker (les registres d'images ont d'abord refusé un téléchargement pour limite de débit, réussi au second essai).
- `AGENTS.md` généré par Next.js retiré (doublon de `CLAUDE.md`), génération coupée par `agentRules: false`.
- Schéma de base écrit en avance (phase 5) car l'administration et l'authentification en dépendent : 4 migrations, 4 fichiers de tests pgTAP.
- Phases 2 et 3 : accueil complet, démonstration au défilement, page démo réellement reliée à la base, pages juridiques en trame.
- Phase 4 : authentification Supabase complète. Défaut trouvé et corrigé : erreur « Date.now() pendant le pré-rendu » sur /espace (D-012).
- Phase 5 : schéma, RLS et tests pgTAP déjà faits en phase 1 ; deux tests rendus indépendants des données laissées par les tests de parcours.
- Relecture de sécurité (agent relecteur-securite) : 3 constats importants confirmés et corrigés (redirection ouverte, admin suspendu, CGU contournables), mineurs traités (D-014). CAPTCHA laissé à configurer par un humain.
- Phase 6 : administration complète. Défauts trouvés par les tests : contrainte de clé de contenu trop stricte, confirmation perdue après « revenir au texte par défaut », en-tête trop large sur mobile (page dézoomée).
- Phase 7 : relecture de phase (aucun bloquant, 4 points importants corrigés, D-015), audit d'accessibilité automatisé (axe, WCAG 2.1 AA) sur 28 pages publiques et connectées, tests clavier, débordements mobiles, liens morts, en-têtes, contrôle SEO (canonique de l'accueil, deux descriptions retouchées). Défaut trouvé : zone de tableau défilante non atteignable au clavier.
- Phase 8 : README pour novice, documents RGPD (`docs/rgpd/`), `docs/paiements.md`, `docs/architecture-future.md`, `vercel.json` (fonctions à Paris), rapport final `docs/RAPPORT-V1.md`. Contrôle complet depuis une base vide : 52 unitaires, 73 pgTAP, 74 parcours, build réussi.
