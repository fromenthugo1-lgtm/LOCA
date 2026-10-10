# Journal

Ce qui s'est passé, daté. On ajoute à la fin.

## 2026-10-10 · Session 1

- Prompt maître reçu, conservé dans `docs/SPEC.md`. Référence visuelle choisie par Hugo : Linear / Vercel.
- Projet Next.js 16.4 créé ; Supabase local démarré sous Docker (les registres d'images ont d'abord refusé un téléchargement pour limite de débit, réussi au second essai).
- `AGENTS.md` généré par Next.js retiré (doublon de `CLAUDE.md`), génération coupée par `agentRules: false`.
- Schéma de base écrit en avance (phase 5) car l'administration et l'authentification en dépendent : 4 migrations, 4 fichiers de tests pgTAP.
