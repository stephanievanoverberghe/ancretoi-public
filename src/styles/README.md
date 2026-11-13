# `src/styles`

Ce dossier contient les fondations CSS globales du site.

- `tokens.css` : tokens semantiques et mapping Tailwind v4 via `@theme inline`.
- `theme.css` : activation light/dark et conventions de theme.
- `reset.css` : reset navigateur minimal.
- `base.css` : base HTML/body, focus visible, sélection, échelle de texte et réduction des animations (système ou préférence applicative).

`src/app/globals.css` est le seul point d'entree global importe par Next.js. Ne pas recreer de second fichier `globals.css` dans `src/styles`.

Les nouveaux composants doivent privilegier Tailwind et les tokens semantiques. Les styles de composants reutilisables vivent dans `src/components/ui`, pas dans des classes globales.
