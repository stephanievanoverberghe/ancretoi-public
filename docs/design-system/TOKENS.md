# Tokens design system

## Philosophie

UI0 pose une base de design tokens sans refaire les pages. Les tokens decrivent des roles stables : couleur de fond, surface, action principale, danger, focus, espacement, elevation et layout.

Les composants doivent consommer des tokens semantiques ou des classes Tailwind mappees vers ces tokens, pas des valeurs hexadecimales dispersees.

## Fichiers

| Fichier | Role |
|---|---|
| `src/styles/tokens.css` | Tokens semantiques et mapping Tailwind v4 via `@theme inline`. |
| `src/styles/theme.css` | Activation light/dark et conventions de theme. |
| `src/styles/reset.css` | Reset navigateur minimal. |
| `src/styles/base.css` | Base HTML/body, focus visible, selection et reduced motion. |
| `src/app/globals.css` | Point d'entree CSS Next.js. |

`src/app/globals.css` est le seul point d'entree global. Il importe Tailwind, les tokens, le theme, le reset et la base. Aucun second `globals.css` ne doit exister dans `src/styles`.

## Couleurs

Roles principaux :

- `background`, `foreground` ;
- `surface`, `surface-muted`, `surface-raised`, `surface-inset`, `surface-hover`, `surface-selected` ;
- `border`, `input`, `ring` ;
- `primary`, `primary-hover`, `primary-foreground` ;
- `secondary`, `accent` ;
- `success`, `warning`, `danger`, `info` ;
- `overlay` ;
- `selection-background`, `selection-foreground`.

Les palettes `brand-*`, `secondary-*` et `gold-*` restent exposees pour compatibilite avec l'UI existante. Elles ont maintenant des valeurs adaptees au dark mode, afin que les classes historiques comme `bg-brand-100` ou `text-brand-900` restent lisibles sur fond sombre.

Le rôle `secondary` clair utilise le corail 600 : son texte blanc atteint le contraste AA. Les nuances corail plus claires restent réservées aux accents décoratifs et aux fonds teintés.

## Typographie

Les familles sont fournies par Next Font :

- `--font-family-body` ;
- `--font-family-display`.

Les tailles, line-height, weights et tracking sont disponibles dans `tokens.css`. Les utilitaires sémantiques `text-caption`, `text-body-sm`, `text-body`, `text-body-lg` et `text-heading-*` sont exposés via Tailwind. Ne pas scaler les tailles avec la largeur viewport.

`--text-scale` vaut `1` par défaut. La préférence d'accessibilité peut le passer à `1.1` ou `1.25` sur la racine ; `base.css` applique alors l'échelle à toute l'interface.

## Espacement, forme et couches

- Espacements sémantiques : contrôles, cartes et sections via `--spacing-*`.
- Rayons source : `--shape-radius-*`, mappés vers `rounded-*`.
- Élévations source : `--elevation-*`, mappées vers `shadow-soft`, `shadow-elevated` et `shadow-focus`.
- Couches : `base`, `raised`, `sticky`, `header`, `dropdown`, `overlay`, `modal`, `toast`.

## Layout

Tokens disponibles :

- containers : `--container-narrow` (48 rem), `--container-page` (72 rem), `--container-wide` (80 rem), `--container-max` (88 rem) ;
- gutters : `--gutter-page` ;
- breakpoints documentaires : `--breakpoint-sm`, `--breakpoint-md`, `--breakpoint-lg`, `--breakpoint-xl`.

## Light / dark

Le theme clair reste disponible explicitement via :

```css
:root[data-theme="light"],
.light { ... }
```

Le theme sombre est active par :

```css
:root[data-theme="dark"],
.dark { ... }
```

Si aucun theme explicite n'est pose, les tokens suivent `prefers-color-scheme: dark`. Pour forcer le clair malgre une preference systeme sombre, poser `data-theme="light"` sur `html` ou une classe `.light` sur le scope concerne.

Regles :

- utiliser les roles semantiques (`surface`, `foreground`, `border`, `primary`) avant les palettes brutes ;
- garder les palettes brutes pour les cas existants ou les accents ponctuels ;
- ne pas hardcoder une variante dark dans les composants ;
- utiliser `surface-hover` et `surface-selected` pour les etats interactifs quand un simple `surface-muted` devient trop faible.

## Accessibilite

- `--ring`, le focus visible generique et le helper rare `.focusable` assurent un focus visible.
- `prefers-reduced-motion` est respecte globalement.
- La classe racine `.reduce-motion` applique la même neutralisation globale quand la préférence vient du compte utilisateur.
- `--text-scale` est consommé sur `html`, et pas uniquement sur la page de réglages.
- Les tokens d'etat (`success`, `warning`, `danger`, `info`) doivent rester lisibles en contraste AA.
- Les cibles tactiles doivent rester gerees dans les composants.

## Interdits

- Pas de nouveau systeme global de classes utilitaires en double de Tailwind.
- Pas de classes globales de composants (`.btn`, `.card`, `.input`, `.badge`).
- Pas de valeurs hex dispersees dans les nouveaux composants si un token existe.
- Pas de melange DB/API/metier dans une PR UI.
- Pas de refonte header/footer/pages dans UI0.
- Les styles Button, Card, Input, Alert et autres primitives doivent vivre dans `src/components/ui`.

## Prochaine etape

UI1 peut introduire progressivement les primitives de base (`Button`, `LinkButton`, `Card`, `Badge`, `Input`, `Textarea`, `Alert`, `Skeleton`, `Container`, `Section`, `Stack`, `Grid`) en s'appuyant sur ces tokens, sans refaire encore toutes les surfaces.
