# `src/features/administration`

Feature cible pour les composants métier d'administration.

À mettre ici :

- composants admin programmes ;
- composants admin articles ;
- tableaux, filtres, modales et formulaires métier ;
- composants QA pédagogique.

À ne pas mettre ici :

- `AdministrationShell` global ;
- route handlers admin ;
- accès DB direct ;
- logique serveur.

L'ancien dossier `src/features/admin` reste legacy jusqu'à fusion PR par PR. Les déplacements se feront progressivement en préservant le build.

## État ARCH6A

Créé et migré :

- `dashboard/AdministrationDashboardPage.tsx` pour `/administration` ;
- `programmes/AdministrationProgrammesPage.tsx` pour `/administration/programmes` ;
- `programmes/nouveau/NouveauProgrammePage.tsx` pour `/administration/programmes/nouveau` ;
- `programmes/modifier/ModifierProgrammePage.tsx` pour `/administration/programmes/[slug]/modifier` ;
- les composants de liste, création et édition des programmes sous `programmes/**/components`.

Restent hors périmètre ARCH6A :

- articles ;
- catégories ;
- inspirations ;
- apprenants ;
- newsletter.

Partagé et déjà sorti de `src/app` :

- `shared/useAdminModalA11y.ts`, utilisé par les modales admin programmes, articles, inspirations et newsletter.

## État ARCH6B

Créé et migré :

- `articles/AdministrationArticlesPage.tsx` pour `/administration/articles` ;
- `articles/nouveau/NouvelArticlePage.tsx` pour `/administration/articles/nouveau` ;
- `articles/modifier/ModifierArticlePage.tsx` pour `/administration/articles/[slug]/modifier` ;
- `articles/archives/ArticlesArchivesPage.tsx` pour `/administration/articles/archives` ;
- `categories/AdministrationCategoriesPage.tsx` pour `/administration/categories` ;
- `categories/nouveau/NouvelleCategoriePage.tsx` pour `/administration/categories/nouveau` ;
- `categories/modifier/ModifierCategoriePage.tsx` pour `/administration/categories/[slug]/modifier` ;
- `inspirations/AdministrationInspirationsPage.tsx` pour `/administration/inspirations` ;
- `inspirations/nouveau/NouvelleInspirationPage.tsx` pour `/administration/inspirations/nouveau` ;
- `inspirations/modifier/ModifierInspirationPage.tsx` pour `/administration/inspirations/[slug]/modifier` ;
- `inspirations/archives/InspirationsArchivesPage.tsx` pour `/administration/inspirations/archives`.

Les composants directement liés aux articles, catégories et inspirations sont maintenant sous `articles/**/components`, `categories/**/components` et `inspirations/**/components`.

Restent hors périmètre ARCH6B :

- apprenants ;
- newsletter.

## État ARCH6C

Créé et migré :

- `apprenants/AdministrationApprenantsPage.tsx` pour `/administration/apprenants` ;
- `apprenants/detail/ApprenantDetailPage.tsx` pour `/administration/apprenants/[id]` ;
- `newsletter/AdministrationNewsletterPage.tsx` pour `/administration/newsletter`.

Composants déplacés :

- `apprenants/components/AdminUsersClient.tsx` ;
- `apprenants/components/AdminRoleSwitch.tsx` ;
- `apprenants/components/ConfirmAction.tsx` ;
- `apprenants/components/UserTabs.tsx` ;
- `newsletter/components/ComposeSendForm.tsx`.

Après ARCH6C, aucun dossier `components` ne reste sous `src/app/(administration)`.
