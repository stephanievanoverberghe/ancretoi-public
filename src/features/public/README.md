# `src/features/public`

Ce dossier regroupe les features qui correspondent au route group `src/app/(public)`.

À mettre ici :

- orchestrateurs des pages publiques ;
- sections publiques spécifiques à une page ou un domaine ;
- composants métier publics liés à l'accueil, aux programmes, au blog, aux inspirations, à l'aide, au légal, au contact et à la méthode ;
- composants client publics directement liés à ces pages, par exemple la gestion des préférences cookies.

À ne pas mettre ici :

- header, footer et shells de layout ;
- composants UI génériques ;
- routes Next.js ;
- route handlers ;
- services serveur partagés ;
- logique d'administration, espace apprenant ou paiement.

Structure cible :

- `accueil/`
- `programmes/`
- `blog/`
- `inspirations/`
- `aide/`
- `legal/`
- `contact/`
- `methode/`

L'accueil UI3A utilise `src/features/public/accueil/HomePage.tsx` comme orchestrateur server-side et des sections dédiées dans `src/features/public/accueil/sections`. La copy éditoriale de cette landing est centralisée dans `src/content/home.ts`.

Les déplacements se font PR par PR pour préserver le build. Le route group reste `src/app/(public)` et ne doit pas apparaître dans l'URL. Les routes visibles restent françaises, et RESET-7 reste en 7 journées sans matin/midi/soir.
