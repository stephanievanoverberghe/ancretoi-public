# Composants design system

Les primitives vivent dans `src/components/ui`. Elles sont generiques, typees, stylisees avec Tailwind via les tokens semantiques et ne contiennent pas de logique metier.

## Structure

| Dossier | Contenu |
|---|---|
| `src/components/ui/actions` | `Button`, `LinkButton`. |
| `src/components/ui/data-display` | `Badge`. |
| `src/components/ui/feedback` | `Alert`, `Skeleton`. |
| `src/components/ui/forms` | `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `SearchInput`, `FormSection`, `FormActions`. |
| `src/components/ui/layout` | `Container`, `Section`, `Stack`, `Grid`. |
| `src/components/ui/navigation` | `Breadcrumbs`. |
| `src/components/ui/overlays` | `FullscreenModal`. |
| `src/components/ui/surfaces` | `Card` et ses sous-composants. |

Le barrel public `@/components/ui` expose les primitives server-safe. Les controles Radix clients restent importes depuis `@/components/ui/forms/client`. Les overlays clients restent importes depuis `@/components/ui/overlays`.

## Regles

- Pas de styles de composants dans les fichiers CSS globaux.
- Pas de logique metier, API, Prisma ou `@/server` dans les primitives.
- Pas de `"use client"` dans le barrel `src/components/ui/index.ts`.
- Les composants clients gardent leur directive dans leur propre fichier ou index client dedie.
- Motion reste reserve a des variantes dediees plus tard pour eviter de clientifier toute la bibliotheque.
- Lucide peut etre passe via des slots ou utilise dans des primitives ciblees.
- Les nouveaux selects visibles du design system utilisent `Select` Radix, pas un `<select>` natif, sauf cas volontaire documente.

## Primitives disponibles

| Composant | Role | Variants / options |
|---|---|---|
| `Button` | Action interactive native. | `primary`, `secondary`, `tertiary`, `ghost`, `danger`; tailles `sm`, `md`, `lg`, `icon`; etat `loading`. |
| `LinkButton` | Lien Next.js avec apparence de bouton. | Mêmes variants, tailles et slots `leftIcon` / `rightIcon` que `Button`; support `disabled` accessible. |
| `Card` | Surface composable. | Variantes `default`, `muted`, `raised`, `inset`, `ghost`; sous-composants `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. |
| `Badge` | Statut ou etiquette courte. | `default`, `secondary`, `success`, `warning`, `danger`, `info`, `outline`; tailles `sm`, `md`. |
| `Alert` | Message transverse. | `info`, `success`, `warning`, `danger`; `title` et `icon` optionnels. |
| `Skeleton` | Etat de chargement visuel. | Animation `animate-pulse` avec respect de `prefers-reduced-motion`. |
| `Container` | Largeur et gouttieres de page. | Tailles monotones `sm`, `md`, `lg`, `xl`, puis `full`. |
| `Section` | Espacement vertical de section. | espacements `sm`, `md`, `lg`. |
| `Stack` | Empilement flex simple. | direction, gap, alignement et justification. |
| `Grid` | Grille responsive simple. | colonnes `1`, `2`, `3`, `4`; gaps `sm`, `md`, `lg`. |

## Form controls

| Composant | Role | Notes |
|---|---|---|
| `Field` | Wrapper de champ. | Server-safe, composition explicite. |
| `FieldLabel` | Label de champ. | Utiliser `htmlFor`; support `required`. |
| `FieldDescription` | Aide de champ. | Utiliser un `id` reference par `aria-describedby`. |
| `FieldError` | Message d'erreur. | `role="alert"`; utiliser un `id` reference par `aria-describedby`. |
| `Input` | Champ texte de base. | Server-safe, `invalid`, `aria-invalid`. |
| `Textarea` | Zone de texte. | Server-safe, `invalid`, `aria-invalid`. |
| `SearchInput` | Recherche avec icone. | Server-safe, Lucide `Search`, `type="search"`. |
| `Slider` | Echelle native simple. | Server-safe, defaut 0-10 pour scores simples. |
| `Select` | Select custom. | Client, Radix Select, clavier, portal, placeholder, disabled, invalid. |
| `Checkbox` | Case custom. | Client, Radix Checkbox, label/description/error optionnels. |
| `RadioGroup` | Groupe radio. | Client, Radix RadioGroup, options typees, vertical/horizontal. |
| `Switch` | Toggle. | Client, Radix Switch, label/description optionnels. |
| `FormSection` | Groupe de champs. | Server-safe, titre/description optionnels. |
| `FormActions` | Zone d'actions. | Server-safe, alignements `start`, `end`, `between`. |

### Imports

Primitives server-safe :

```tsx
import { Button, Field, FieldLabel, Input } from '@/components/ui';
```

Controles Radix clients :

```tsx
import { Select, Checkbox, RadioGroup, Switch } from '@/components/ui/forms/client';
```

Overlay client :

```tsx
import { FullscreenModal } from '@/components/ui/overlays';
```

`FullscreenModal` repose sur Radix Dialog : focus trap, retour du focus, verrouillage du scroll et fermeture clavier sont fournis par la primitive. `closeOnEsc` et `closeOnBackdrop` permettent de bloquer explicitement ces fermetures.

### Cartes

- `Card` choisit la nature de la surface avec `variant`, sans couleur codée en dur.
- `CardHeader`, `CardContent` et `CardFooter` acceptent `padding="none" | "sm" | "md" | "lg"`.
- Une classe historique `p-*` sur ces sous-composants reste prioritaire pour compatibilité.
- `CardTitle` accepte `size="sm" | "md" | "lg"` et `as="h2" | "h3" | "h4"` pour respecter la hiérarchie du document.

## Accessibilite formulaires

- `FieldLabel` doit pointer vers le controle via `htmlFor`.
- `FieldDescription` et `FieldError` doivent etre relies au controle via `aria-describedby`.
- Les controles avec erreur doivent recevoir `aria-invalid`.
- Les cibles tactiles doivent rester au minimum autour de 40 px.
- Les erreurs visibles utilisent un texte clair et non technique.
- React Hook Form et Zod ne sont pas couples aux primitives; ils seront branches au niveau des formulaires metier.

## `cn`

`src/lib/cn.ts` compose les classes conditionnelles et résout, sans dépendance, les conflits courants utilisés par les primitives : couleurs, typographie, rayons, bordures, ombres, espacements, tailles et layout. La dernière classe d'un même groupe et d'un même modificateur (`sm:`, `hover:`, etc.) gagne.

Ce helper reste volontairement ciblé. Si le projet commence à composer massivement des plugins Tailwind ou des utilitaires arbitraires complexes, remplacer cette résolution locale par `clsx` + `tailwind-merge` dans une PR dédiée.

## Hors perimetre UI1B

- pas de refonte header/footer ;
- pas de migration massive des pages ;
- pas de form builder ;
- pas de DatePicker complet ;
- pas de FileUpload ;
- pas de RichTextEditor ;
- pas d'integration globale React Hook Form/Zod ;
- pas de shadcn/ui genere ;
- pas de Motion dans les primitives de base ;
- pas de Sonner, TanStack Table ou Playwright.

## Prochaine etape

UI2 peut construire les composants composes et layouts responsive en s'appuyant sur ces primitives : header, footer, shells public/espace/admin et premiers blocs reutilisables.
