# `src/components/ui`

Ce dossier contient les primitives UI generiques du design system.

A mettre ici :

- boutons et liens boutons ;
- champs de formulaire de base ;
- badges, alertes, skeletons ;
- cartes et primitives de layout ;
- composants visuels sans logique metier.

A ne pas mettre ici :

- composants propres aux programmes, au blog, a l'espace ou a l'administration ;
- appels API ;
- acces serveur ;
- regles metier.

Les primitives sont server-safe par defaut. Un composant client doit garder son propre `"use client"` dans son fichier, pas dans le barrel `index.ts`.

## Structure

- `actions` : `Button`, `LinkButton`.
- `data-display` : `Badge`.
- `feedback` : `Alert`, `Skeleton`.
- `forms` : `Field`, `Input`, `Textarea`, `SearchInput`, `Slider`, `FormSection`, `FormActions`, et controles clients `Select`, `Checkbox`, `RadioGroup`, `Switch`.
- `layout` : `Container`, `Section`, `Stack`, `Grid`.
- `navigation` : `Breadcrumbs`.
- `overlays` : `FullscreenModal`, basée sur Radix Dialog.
- `surfaces` : `Card` et ses sous-composants, avec variantes de surface, padding et titre explicites.

Le barrel public reste `src/components/ui/index.ts` pour les imports applicatifs :

```tsx
import { Button, Card, Input } from '@/components/ui';
```

Les overlays clients restent importes depuis leur sous-dossier pour ne pas melanger le barrel server-safe :

```tsx
import { FullscreenModal } from '@/components/ui/overlays';
```

Les controles Radix clients restent importes depuis l'index client dedie :

```tsx
import { Select, Checkbox, RadioGroup, Switch } from '@/components/ui/forms/client';
```
