# Conventions types, utils et helpers

## Principe

Local d'abord, domaine ensuite, global seulement si vraiment transversal.

## Types

| Type | Emplacement |
|---|---|
| Utilise par un seul fichier | Dans le fichier. |
| UI d'un domaine feature | `src/features/<zone>/<domaine>/*.types.ts`. |
| Serveur/data d'un domaine | `src/server/<domaine>/*.types.ts`. |
| API/pagination/routes vraiment transverses | `src/types/*.types.ts`. |
| Prisma brut | Ne pas exposer hors `src/server` sauf type interne explicite. |

`src/types` ne doit pas devenir un fourre-tout.

## Utils

| Helper | Emplacement |
|---|---|
| UI local | Dans le domaine feature. |
| Helper serveur domaine | `src/server/<domaine>/*.utils.ts`. |
| Helper serveur transversal | `src/server/shared`. |
| Helper pur client-safe transversal | `src/lib`. |
| Helper DB | Repository, mapper ou `src/server/db` selon usage. |

Ne pas creer de dossier global `src/utils`.

## Constants, schemas, mappers

- Constantes locales : dans le fichier.
- Constantes de domaine : `*.constants.ts` dans le domaine.
- Configuration globale : `src/config`.
- Contenus editoriaux : `src/content`.
- Schemas UI/form client-safe : domaine feature.
- Schemas serveur/API : `src/server/<domaine>` ou `src/server/shared`.
- Mapper UI : domaine feature.
- Mapper DB/server : domaine serveur.
