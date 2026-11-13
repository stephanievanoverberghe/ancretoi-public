# Architecture du repo

## Dossiers principaux

| Chemin | Responsabilite |
|---|---|
| `src/app` | Routes Next.js, layouts, route handlers API, metadata. |
| `src/features` | Orchestrateurs de pages et UI metier par domaine. |
| `src/components/ui` | Primitives UI generiques. |
| `src/components/layout` | Header, footer, shells et navigation globale. |
| `src/components/common` | Petits composants transverses sans domaine fort. |
| `src/components/feedback` | Etats loading, error, empty, alertes. |
| `src/server` | Services serveur, repositories, mappers, logique metier serveur. |
| `src/server/db` | Client Prisma et checks DB. |
| `src/lib` | Utilitaires purs, client-safe ou neutres. |
| `src/config` | Routes, navigation, SEO, options globales. |
| `src/content` | Contenus statiques et editoriaux. |
| `src/types` | Types vraiment transverses, client-safe. |
| `src/styles` | Tokens, theme et classes globales minimales. |
| `prisma` | Schema Prisma, migrations et configuration DB. |

## Boundaries

- Prisma reste cote serveur.
- Les repositories contiennent les requetes Prisma.
- Les services contiennent la logique metier.
- Les mappers transforment DB vers DTO.
- Les routes API restent des controleurs HTTP minces.
- Les fichiers `"use client"` ne doivent pas importer `@/server`.
- Les composants et features ne doivent pas contenir d'appel DB.
- Aucun dossier `src/models` manuel ne doit etre recree.

## Page Orchestrators

Les fichiers `src/app/**/page.tsx` restent minces. Ils peuvent charger les donnees route-level et rendre un orchestrateur `*Page` depuis `src/features`.

Ils ne doivent pas contenir de gros JSX metier, de mapping lourd, de validations longues ou de logique DB directe.
