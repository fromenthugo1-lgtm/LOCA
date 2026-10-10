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
