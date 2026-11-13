# Auth Prisma

## Etat

L'auth email/password utilise Prisma/Neon comme source principale.

Les flux concernes :

- inscription ;
- connexion ;
- session utilisateur ;
- roles admin/user ;
- reset password ;
- guards `requireUser` et `requireAdmin`.

## Garde-fous

- Ne pas modifier cookies, JWT, duree de session ou hash sans PR auth dediee.
- Ne jamais commiter de mot de passe ou secret.
- Tout bootstrap admin doit rester protege par variables explicites.
