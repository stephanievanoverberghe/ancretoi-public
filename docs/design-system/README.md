# Design system

## Documents

- `TOKENS.md` : tokens, theme, structure CSS et regles globales.
- `COMPONENTS.md` : primitives UI, variants et regles d'usage.
- `LAYOUTS.md` : header, footer et shells responsive.
- `NAVIGATION.md` : routes, navigation centralisee, contenus de layout et regles anti-duplication.
- `STACK_UI.md` : stack UI retenue, usages actuels et pistes futures.

## Structure CSS

`src/app/globals.css` est le seul point d'entree global.

Ordre d'import :

1. Tailwind CSS ;
2. `src/styles/tokens.css` ;
3. `src/styles/theme.css` ;
4. `src/styles/reset.css` ;
5. `src/styles/base.css`.

Les styles de composants reutilisables doivent etre portes par les composants du design system dans `src/components/ui`.

## Primitives

UI1 et UI1B introduisent les primitives de base dans `src/components/ui`, rangees par famille (`actions`, `forms`, `feedback`, `layout`, `surfaces`, `data-display`, `navigation`, `overlays`). Le barrel public `@/components/ui` expose les primitives server-safe; les controles Radix clients s'importent depuis `@/components/ui/forms/client`; les overlays clients restent importes depuis `@/components/ui/overlays`.

Ces composants sont server-safe par defaut. Les animations Motion restent a introduire progressivement dans des PR dediees lorsque le besoin d'interaction le justifie.

## Layouts

UI2 range les structures globales dans `src/components/layout/public`, `src/components/layout/app` et `src/components/layout/admin`. UI2B centralise les routes dans `src/config/routes.ts`, les liens dans `src/config/navigation.ts` et la copy de layout dans `src/content/layout.ts`.

UI2C distingue clairement le site public des zones connectees. Le public utilise `PublicChrome`; l'espace apprenant et l'administration utilisent des shells applicatifs pleine largeur avec sidebar desktop collee au viewport, topbar applicative, acces compte/notifications et navigation mobile dediee.

Les composants interactifs de navigation restent client-only localement; les shells n'importent pas Prisma et ne portent pas de logique metier lourde.

## Surfaces publiques

UI3A refond l'accueil public comme landing de plateforme de formation. Les textes éditoriaux vivent dans `src/content/home.ts`; les sections de page vivent dans `src/features/public/accueil/sections` et consomment les primitives du design system. Les sections doivent rester compatibles light/dark en utilisant les tokens sémantiques (`background`, `surface`, `surface-muted`, `foreground`, `muted-foreground`, `border`, `primary`, `secondary`, `accent`).

La prochaine étape prévue est UI3B : refonte du catalogue Programmes, sans modifier la couche DB ni les routes visibles.
