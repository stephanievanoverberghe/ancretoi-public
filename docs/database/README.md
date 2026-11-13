# Database

Neon/Prisma est la base principale de l'application.

## Documents

- `PRISMA_DATA_LAYER.md` : architecture repositories/services/mappers.
- `ENVIRONMENT_VARIABLES.md` : variables serveur attendues.
- `NEON_CUTOVER_PLAN.md` : etat du cutover Neon.
- `AUTH_PRISMA_CUTOVER.md` : notes auth Prisma.
- `PROGRAMS_CANONICAL_SEED.md` : contenu canonique programmes.

## Regles

- Ne pas reintroduire Mongo/Mongoose.
- Ne pas modifier `schema.prisma` sans PR DB dediee.
- Ne pas lancer `migrate reset`, `db push`, `migrate deploy` ou seed depuis une PR UI.
- Ne jamais commiter `.env`, `.env.local` ni `src/generated/prisma`.
