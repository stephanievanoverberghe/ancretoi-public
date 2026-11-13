# `src/components/layout`

Ce dossier contient les structures globales de navigation et de shell.

## Structure

- `public` : header, footer, menu mobile public et menu compte.
- `app` : shell pleine largeur, sidebar, topbar et navigation mobile de l'espace apprenant.
- `admin` : shell pleine largeur, sidebar CMS, topbar et drawer mobile de l'administration.

## Règles

- Pas de logique métier lourde dans les layouts.
- Pas d'accès DB ou Prisma dans les composants clients.
- Les composants interactifs sont isolés avec `"use client"`.
- Les drawers mobile publics et admin utilisent Radix Dialog, pas une gestion maison du focus/overlay.
- Les pages et features restent responsables de leur contenu métier, de leur centrage et de leurs cartes.
- Les chemins viennent de `src/config/routes.ts`.
- Les liens et groupes de navigation viennent de `src/config/navigation.ts`.
- La copy statique de layout vient de `src/content/layout.ts`.
- Le header/footer publics ne sont pas rendus dans `/espace` et `/administration`.
- Les zones connectées utilisent leur propre topbar applicative : contexte courant, accès rapides, compte et notifications.
- Les sidebars desktop des zones connectées sont collées au viewport, sans `max-w` de shell et sans scrollbar interne dans le cas nominal.
