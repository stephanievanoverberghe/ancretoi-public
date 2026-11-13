# Couche data Prisma

## Cible

`prisma/schema.prisma` est la source des modeles de donnees. Le client genere dans `src/generated/prisma` n'est jamais modifie manuellement.

Le seul point d'entree du client Prisma applicatif est `src/server/db/prisma.ts`.

## Couches

| Couche | Role |
|---|---|
| Repository | Requetes Prisma brutes, projections, transactions domaine. |
| Service | Logique metier, orchestration, permissions, validations serveur. |
| Mapper | Transformation Prisma vers DTO applicatifs. |
| Type | Contrats de domaine, inputs/outputs serveur ou DTO. |
| Route API | Lecture requete, parsing minimal, appel service, reponse HTTP. |

## Boundaries

Interdits :

- Prisma dans `src/features` ou `src/components` ;
- Prisma dans un fichier `"use client"` ;
- `@/server` dans un fichier `"use client"` ;
- dossier `src/models` manuel ;
- Mongo/Mongoose dans le code actif.

Les scripts `scripts/db/**` peuvent importer Prisma pour les checks, seeds proteges ou diagnostics explicites.
