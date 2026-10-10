# SpendEdge

Site et fondations de SpendEdge : un service qui automatise les demandes de prix des professionnels auprès de leurs fournisseurs.

> Documentation complète d'installation : en cours de rédaction (phase 8). En attendant, les commandes sont listées dans `CLAUDE.md`.

## Démarrage rapide (développeur)

```bash
npm install          # installe les dépendances
npm run db:start     # démarre Supabase en local (Docker Desktop doit être lancé)
npm run env:local    # crée .env.local à partir de Supabase local
npm run dev          # ouvre le site sur http://localhost:3000
```

## Documents

- `docs/SPEC.md` : cahier des charges
- `docs/ROADMAP.md` : état des phases et modules futurs
- `docs/DECISIONS.md` : décisions techniques
- `DESIGN.md` : identité visuelle
- `JOURNAL.md` : historique des sessions
