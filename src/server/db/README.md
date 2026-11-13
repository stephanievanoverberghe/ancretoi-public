# Prisma server conventions

Prisma + Neon est la base principale du projet.

## Client

- Le client Prisma serveur est expose par `src/server/db/prisma.ts`.
- Le client utilise `@prisma/adapter-neon`, requis avec Prisma 7.
- `getPrismaClient()` initialise la connexion uniquement a l'appel, pour ne pas casser le build si `DATABASE_URL` manque.
- En developpement, l'instance est gardee sur `globalThis` pour limiter les connexions pendant le hot reload.

## Variables

- `DATABASE_URL` : URL Neon pooled utilisee par l'application au runtime.
- `DIRECT_URL` : URL Neon directe utilisee par la CLI Prisma et les migrations.

Ne jamais commiter de vraie URL Neon.

## Healthcheck

Routes internes :

```txt
GET /api/internal/prisma-health
GET /api/ping
```

Comportements attendus :

- sans `DATABASE_URL` : `{ "ok": false, "error": "DATABASE_URL is not configured." }` ;
- avec `DATABASE_URL` valide : `{ "ok": true }` ;
- avec connexion invalide : `{ "ok": false, "error": "Prisma connection check failed." }`.

Le healthcheck execute uniquement `SELECT 1`. Il ne cree pas de table et ne seed pas.

## Commandes utiles

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
npx prisma migrate deploy
npm run lint
npm run build
```

Ne pas lancer `prisma migrate dev`, `prisma db push` ou `prisma migrate reset` sans validation explicite.
