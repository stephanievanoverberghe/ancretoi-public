# Smoke tests authentifies Prisma

## Objectif

Tester les parcours connectes sans navigateur et sans seed global :

- utilisateur test ;
- admin test ;
- acces apprenant a `reset-7` ;
- progression / next step ;
- journal J1 ;
- produit et achat simule ;
- lecture admin programmes/unites.

## Scripts

| Script | Role | Ecriture DB |
|---|---|---|
| `npm run test:prisma-authenticated` | Smoke test authentifie lecture seule | Non |
| `npm run test:prisma-authenticated:prepare` | Preparation idempotente des donnees de test | Non par defaut |

Le preparateur refuse les ecritures sans :

- `ALLOW_TEST_DB_WRITES=true` ;
- `CONFIRM_TEST_DATA_SCOPE=prisma-authenticated-smoke` ;
- branche Neon dediee, non `main` ;
- mots de passe de test fournis localement.

## Donnees attendues

- `test-user@ancre-toi.local` role `USER`.
- `test-admin@ancre-toi.local` role `ADMIN`.
- Enrollment actif du user sur `reset-7`.
- DayState J1.
- Product test pour `reset-7`.
- Purchase simule optionnel.

Ces donnees ne doivent jamais etre creees automatiquement sur Neon main.
