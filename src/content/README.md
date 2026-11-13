# `src/content`

Ce dossier accueille les contenus statiques et éditoriaux.

## Fichiers

- `layout.ts` : textes de header, footer, CTA de layout, shells connectés et libellés ARIA partagés.
- `home.ts` : copy éditoriale de l'accueil public, teasers programmes et CTA de landing.

## À mettre ici

- copy publique ;
- contenus statiques programmes ;
- contenus légaux ;
- textes partagés ;
- micro-copies qui ne sont pas de la configuration technique.

## À ne pas mettre ici

- logique runtime ;
- accès DB ;
- composants interactifs ;
- secrets ;
- chemins de routes sans passer par `src/config/routes.ts`.

Les contenus sont déplacés PR par PR en gardant le build stable. Les routes visibles restent françaises. RESET-7 reste en 7 journées, sans matin/midi/soir.
