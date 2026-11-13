# Stack UI

## Utilise maintenant

| Outil | Role |
|---|---|
| Next.js App Router | Framework applicatif et routage. |
| React | Interface. |
| TypeScript | Typage. |
| Tailwind CSS v4 | Systeme de design via classes utilitaires et `@theme inline`. |
| Motion | Animations ponctuelles, a utiliser avec `prefers-reduced-motion`. |
| Lucide React | Icones. |
| React Hook Form + Zod | Formulaires et validation. |

## Inspiration / adoption progressive

| Outil | Decision |
|---|---|
| shadcn/ui | Inspiration de composition, pas d'installation massive automatique. |
| Radix UI | Primitives accessibles quand un composant le justifie. |
| Sonner | Toasts, a introduire dans une PR dediee. |
| TanStack Table | Tables admin/CRM quand les vues admin seront refaites. |
| TanStack Query | Cache client uniquement si une zone dynamique le justifie. |
| Zustand | Etat UI global leger si necessaire, jamais donnees serveur. |
| dnd-kit | Drag and drop plus tard. |
| Tiptap | Editeur riche plus tard. |
| UploadThing / React Dropzone | Upload plus tard. |
| date-fns | Dates, a ajouter seulement si un besoin concret apparait. |
| Recharts | Graphiques dashboard plus tard. |
| React Flow | Workflows visuels plus tard. |
| Embla Carousel | Carrousels, uniquement si le besoin UX est valide. |
| Lenis | Scroll fluide avec prudence, jamais par defaut. |
| cmdk | Palette de commandes plus tard. |
| React Day Picker | Calendriers quand necessaire. |
| Driver.js | Tutoriels interactifs plus tard. |
| Fuse.js | Recherche floue locale si besoin. |
| React Email | Templates emails. |
| React PDF | Generation PDF. |

## Regles UI0B

- Ne pas installer de nouvelles dependances.
- Ne pas convertir le projet a shadcn/ui automatiquement.
- Ne pas generer de composants en masse.
- Ne pas mettre de styles de composants dans les CSS globaux.
- Les primitives UI arrivent en UI1, par petits lots.
