# Ancre-toi

Application Next.js réunissant le site public, l’espace apprenant et l’administration d’Ancre-toi.

## Démarrage local

Prérequis : Node.js, npm et une configuration locale inspirée de `.env.local.example`.

```bash
npm install
npm run dev
```

Le site est alors disponible sur [http://localhost:3000](http://localhost:3000).

## Vérifications

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e
```

Les tests E2E lancent eux-mêmes le serveur Next.js et couvrent les principaux parcours publics, l’authentification, le responsive et l’accessibilité.

## Architecture

- `src/app` : routes et metadata Next.js ;
- `src/features` : orchestrateurs de pages et UI métier ;
- `src/components` : primitives et layouts transverses ;
- `src/server` : services serveur et accès aux données ;
- `src/config` : routes et navigation ;
- `src/content` : contenus statiques ;
- `src/styles` : tokens et styles globaux ;
- `prisma` : schéma PostgreSQL/Neon.

Les décisions durables sont documentées dans `docs/architecture/DECISIONS.md`. Les conventions de design sont dans `docs/design-system/`.

## Routes principales

- public : `/`, `/programmes`, `/methode`, `/blog`, `/inspirations`, `/aide` ;
- authentification : `/connexion`, `/inscription`, `/mot-de-passe-oublie` ;
- apprenant : `/espace`, `/espace/formations`, `/espace/journal`, `/espace/bilan`, `/espace/plan-30-jours` ;
- administration : `/administration`.

## Données et services externes

- PostgreSQL/Neon via Prisma est la source de données principale ;
- Stripe gère le paiement ;
- les identifiants légaux et URLs sociales de production doivent être renseignés par variables d’environnement ;
- les analytics ne sont chargées qu’après consentement.

Ne jamais ajouter de nouvelle couche MongoDB/Mongoose.
