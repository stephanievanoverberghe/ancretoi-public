# `src/config`

Ce dossier accueille la configuration applicative stable.

## Fichiers

- `routes.ts` : chemins visibles, builders, prefixes et routes visibles françaises.
- `navigation.ts` : liens, labels, groupes, ordre et icônes des navigations.

## À mettre ici

- routes visibles ;
- groupes de navigation ;
- groupes admin et éléments désactivés ou à venir ;
- constantes techniques transverses ;
- options globales sans secret.

## À ne pas mettre ici

- secrets ;
- accès DB ;
- logique métier lourde ;
- composants React ;
- textes éditoriaux longs.

Les textes de header, footer et shells vont dans `src/content/layout.ts`. Les routes visibles restent françaises. RESET-7 reste en 7 journées, sans matin/midi/soir.
