# `src/app`

Ce dossier contient les routes Next.js App Router, les layouts, les metadata et les route handlers.

À mettre ici :

- `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` ;
- `route.ts` pour les APIs ;
- assemblage mince des pages.

À ne pas mettre ici :

- gros composants métier ;
- logique métier lourde ;
- accès DB dispersés ;
- styles dupliqués.

Les déplacements vers les route groups se feront PR par PR en gardant le build stable. Les routes visibles restent françaises. RESET-7 reste en 7 journées, sans matin/midi/soir.
