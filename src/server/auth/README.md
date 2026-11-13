# `src/server/auth`

Services serveur pour l'authentification, les sessions et les autorisations.

Contenu actuel :

- `session.ts` : JWT, cookies de session et lecture depuis `NextRequest` ;
- `authz.ts` : `getCurrentUser`, `requireUser`, `requireAdmin` ;
- `auth.service.ts` : facade auth Prisma ;
- `auth-prisma.service.ts` : lectures et mutations `User` / `PasswordReset` via Prisma ;
- `display-name.ts` : nom affiche apprenant, server-only.

DB5B fait de Prisma / Neon la source principale pour l'inscription, la connexion, les roles, le profil compte et le reset password.

A ne pas mettre ici :

- pages de connexion ;
- composants de formulaire ;
- refonte JWT/cookies/hash sans demande explicite ;
- logique paiement, email ou newsletter.

Les imports depuis des composants client sont interdits. Les routes visibles restent francaises. RESET-7 reste en 7 journees, sans matin/midi/soir.
