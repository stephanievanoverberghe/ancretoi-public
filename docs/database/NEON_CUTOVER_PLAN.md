# Cutover Neon/Prisma

## Etat courant

- Neon/Prisma est la base principale.
- Mongo/Mongoose a ete retire du code actif.
- Le code applicatif ne doit plus contenir de fallback Mongo.
- Les domaines doivent rester branches via repositories et services serveur.

## Validations de base

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
node scripts/db/check-neon-schema.cjs
npm run check:prisma-boundaries
npm run test:prisma-data
npm run test:prisma-functional
npm run test:prisma-authenticated
```

Les PR UI ne doivent pas lancer de migration, de seed global ou de reset DB.
