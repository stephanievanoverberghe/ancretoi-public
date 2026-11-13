# AGENTS.md - Ancre-toi

## Contexte projet

Ancre-toi est une application Next.js App Router avec :

- site public ;
- espace apprenant ;
- administration ;
- blog ;
- inspirations ;
- newsletter ;
- programmes guidés ;
- parcours d'apprentissage ;
- PostgreSQL / Neon / Prisma comme base principale ;
- Stripe ;
- settings utilisateur.

Le projet entre dans une nouvelle phase de réalignement produit. Les documents Google Drive Ancre-toi deviennent la source produit principale. La priorité est de rendre le site exploitable, mobile-first, cohérent avec les formations et entièrement aligné avec les décisions produit validées.

## Sources de vérité

Ordre de priorité pour les futures tâches :

1. demande utilisateur la plus récente ;
2. décisions validées dans `docs/architecture/DECISIONS.md` ;
3. documents Google Drive Ancre-toi ;
4. documentation stable dans `docs/architecture`, `docs/database`, `docs/quality` et `docs/design-system` ;
5. code existant du repo.

Si le repo contredit une décision produit documentée, la décision produit gagne. Si deux documents Drive se contredisent, ne pas inventer : signaler l'écart et demander un arbitrage.

## Règles générales

- Ne jamais faire de réécriture massive sans demande explicite.
- Travailler par petites PR atomiques.
- Préserver le build à chaque étape.
- Ne pas modifier Stripe, l'authentification profonde ou la couche base de données sans demande explicite.
- Ne pas créer de modèle Mongoose.
- Ne pas ajouter de dépendance MongoDB / Mongoose.
- Ne pas installer de librairie sans PR dédiée et décision documentée.
- Ne pas réintroduire MongoDB / Mongoose dans le code actif.
- Ne pas supprimer un fichier sans justification claire.
- Respecter les changements locaux existants et ne pas les revert sans demande explicite.

## Règles routes

- Toutes les routes visibles utilisateur doivent être en français.
- Les routes visibles doivent être en kebab-case, sans accents.
- Ne jamais créer de nouvelle route visible anglaise.
- Ne pas conserver les anciennes URLs anglaises.
- Ne pas créer de redirection legacy sauf demande explicite.
- Les APIs techniques peuvent rester en anglais temporairement.
- Utiliser les route groups Next.js pour organiser les zones : `(public)`, `(auth)`, `(espace)`, `(administration)`.
- Les route groups ne doivent jamais apparaître dans l'URL.
- Toute nouvelle route visible doit être ajoutée à `src/config/routes.ts` quand ce fichier existera.

Routes visibles cibles :

- public : `/`, `/programmes`, `/programmes/[slug]`, `/methode`, `/temoignages`, `/blog`, `/blog/[slug]`, `/inspirations`, `/inspirations/[slug]`, `/aide`, `/aide/[slug]`, `/contact`, `/mentions-legales`, `/conditions-generales`, `/confidentialite`, `/cookies` ;
- espace apprenant : `/espace`, `/espace/continuer`, `/espace/formations`, `/espace/formations/[programme]`, `/espace/formations/[programme]/jour/[jour]`, `/espace/journal`, `/espace/notes`, `/espace/ressources`, `/espace/plan-30-jours`, `/espace/bilan`, `/espace/compte` ;
- administration : `/administration`, `/administration/programmes`, `/administration/programmes/nouveau`, `/administration/programmes/[slug]/modifier`, `/administration/articles`, `/administration/articles/nouveau`, `/administration/categories`, `/administration/inspirations`, `/administration/apprenants`, `/administration/achats`, `/administration/progression`, `/administration/exports`, `/administration/qualite`, `/administration/parametres` ;
- auth : `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe` ;
- paiement : `/paiement`, `/paiement/succes`, `/paiement/annule`.

Toute PR de routing doit vérifier et mettre à jour si concerné :

- navigation header/footer/mobile ;
- liens internes ;
- middleware ;
- guards ;
- metadata canonical ;
- sitemap ;
- robots ;
- tests manuels des routes publiques et protégées.

## Règles RESET-7

RESET-7 V1 est défini comme :

- 7 jours ;
- 1 page par jour ;
- 1 vidéo principale par jour ;
- 1 journal par jour ;
- 1 mantra par jour ;
- 1 validation par jour ;
- 1 bilan final J7 ;
- 1 plan 30 jours ;
- 1 export PDF/JSON.

Routes RESET-7 V1 :

- `/espace/formations/reset-7` ;
- `/espace/formations/reset-7/jour/1` à `/jour/7` ;
- `/espace/bilan` ;
- `/espace/plan-30-jours`.

Ne jamais réintroduire matin / midi / soir pour RESET-7 V1. Toute logique `MOR`, `MID`, `EVE`, `matin`, `midi` ou `soir` liée à RESET-7 doit être considérée comme ancienne piste non retenue V1, sauf demande explicite contraire.

## Règles programmes

- RESET-7 est prioritaire côté membre pour la V1.
- BOUSSOLE-10, ANCRAGE-30 et ALCHIMIE-90 doivent exister côté public et garder une structure future, mais ne doivent pas être développés entièrement côté espace apprenant maintenant.
- Le nom public retenu est `ANCRAGE-30`.
- Le slug public retenu est `ancrage-30`.
- Ne pas utiliser `ancre-30` pour de nouvelles routes visibles.
- Prisma + Neon est la source officielle pour les programmes, unités et contenus éditables.
- Les JSON de contenus programmes, s'ils existent, restent des références de seed ou de contenu, pas une couche DB active.
- Toute lecture de programme doit passer par un service serveur central.

## Règles espace apprenant

- `/espace` est la route canonique du dashboard apprenant.
- Ne pas multiplier `/espace` et `/espace/tableau-de-bord` sans nécessité.
- L'expérience doit être mobile-first.
- La page doit toujours mettre en avant le prochain pas utile.
- Les messages doivent être clairs, doux, non culpabilisants.
- La sécurité émotionnelle doit être visible : pause, stop, aide, retour à une route sûre.

## Règles auth

- Auth V1 = email/password existant.
- Les routes visibles deviennent `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`.
- Magic-link = piste future, à ne pas implémenter maintenant.
- Ne pas modifier JWT, cookies, hash ou durée de session sans demande explicite.

## Règles UX/UI

- Toute PR UX doit être mobile-first.
- Respecter WCAG AA autant que possible.
- Prévoir focus visible, labels, états loading/error/empty/success.
- Ne pas introduire d'animations qui nuisent à l'accessibilité.
- Utiliser `prefers-reduced-motion` quand une animation est ajoutée.
- Les textes doivent tenir sur mobile sans chevauchement.
- Les CTA doivent être explicites.
- Les erreurs ne doivent pas exposer de détail technique inutile.

## Règles architecture

- `src/app` : routes Next.js uniquement.
- `src/app/(public)` : routes publiques visibles.
- `src/app/(auth)` : routes auth visibles.
- `src/app/(espace)` : routes espace apprenant visibles.
- `src/app/(administration)` : routes administration visibles.
- `src/app/api` : route handlers API.
- `src/components/ui` : composants UI génériques.
- `src/components/layout` : shells, headers, footers, navigation.
- `src/components/feedback` : états, alertes, messages transverses.
- `src/components/common` : petits composants transverses non métier.
- `src/features` : logique métier par domaine.
- `src/server` : services serveur et accès données.
- `src/config` : routes, navigation, programmes, SEO.
- `src/content` : copy, contenus statiques, programmes et légal.
- `src/styles` : tokens, theme et classes globales minimales.
- `prisma/schema.prisma` : source des modèles de données.
- `src/server/db/prisma.ts` : point d'entrée Prisma applicatif.
- `src/lib` : utilitaires purs, configuration, formatters.

Les fichiers dans `src/app` doivent rester minces. Ils peuvent charger les données nécessaires, assembler les composants, définir les metadata et exposer des route handlers. Ils ne doivent pas contenir de gros composants inline, logique métier complexe, mapping lourd, validations longues ou styles dupliqués.

Toute logique métier doit sortir vers `src/features` ou `src/server`. Toute PR de déplacement doit être atomique et préserver le build. Ne pas mélanger architecture, DB, UX/UI et routing dans une seule PR.

## Règles Page Orchestrators et nommage

Les fichiers `src/app/**/page.tsx` doivent rester très minces. Ils peuvent :

- recevoir `params` et `searchParams` ;
- définir ou importer `metadata`, `generateMetadata` et `generateStaticParams` ;
- importer un orchestrateur de page depuis `src/features` ;
- retourner cet orchestrateur.

Ils ne doivent pas contenir :

- gros rendu JSX de page ;
- sections métier inline ;
- logique métier lourde ;
- mapping de données complexe ;
- validations longues ;
- composants client complets.

Les vrais composants de page vivent dans `src/features`, pas dans `src/components`.

Cette règle s'applique à toutes les zones :

- pages publiques ;
- pages programmes ;
- pages blog ;
- pages inspirations ;
- pages aide et légales ;
- pages auth ;
- pages paiement ;
- pages newsletter transactionnelles ;
- pages espace apprenant ;
- pages administration.

Exemples cibles :

- `src/app/(public)/page.tsx` importe `HomePage` depuis `src/features/marketing/home/HomePage.tsx` ;
- `src/app/(public)/programmes/page.tsx` importe `ProgrammesPage` depuis `src/features/programmes/catalog/ProgrammesPage.tsx` ;
- `src/app/(public)/programmes/[slug]/page.tsx` importe `ProgrammeDetailPage` depuis `src/features/programmes/detail/ProgrammeDetailPage.tsx` ;
- `src/app/(espace)/espace/page.tsx` importe `EspaceDashboardPage` depuis `src/features/apprentissage/dashboard/EspaceDashboardPage.tsx` ;
- `src/app/(administration)/administration/programmes/page.tsx` importe `AdministrationProgrammesPage` depuis `src/features/administration/programmes/AdministrationProgrammesPage.tsx`.

Chaque nouvelle page doit avoir un Page Orchestrator dans `src/features`. Avant de refactoriser une page existante, vérifier `docs/architecture/REPO_ARCHITECTURE.md` et `docs/architecture/NAMING_CONVENTIONS.md`.

Conventions de nommage :

- orchestrateurs de page : suffixe `Page`, par exemple `HomePage`, `ProgrammesPage`, `FormationDayPage` ;
- sections de page : suffixe `Section`, par exemple `HeroSection`, `FaqSection`, `CurriculumSection` ;
- cartes : suffixe `Card`, par exemple `ProgrammeCard`, `ArticleCard`, `UnitCard` ;
- modales : suffixe `Modal` ;
- formulaires : suffixe `Form` ;
- barres d'outils : suffixe `Toolbar` ;
- types/helpers/constants/mappers : `*.types.ts`, `*.utils.ts`, `*.constants.ts`, `*.mapper.ts`.

Éviter les noms vagues comme `Main`, `Block`, `Content`, `Wrapper`, `View` ou `Client` sans contexte métier clair. Ne pas renommer massivement le repo dans une seule PR : les renommages se font progressivement et par domaine.

## Règles stack

- Ne pas installer toute la stack d'un coup.
- `React Hook Form` et `Zod` sont prioritaires pour formulaires, journal, auth et settings.
- `shadcn/ui` et `Radix UI` sont pertinents pour une base UI accessible, mais doivent être introduits progressivement.
- `TanStack Table` est pertinent pour l'administration.
- `TanStack Query` est réservé aux zones client dynamiques.
- `Zustand` doit rester limité à l'état UI global, pas aux données serveur.
- `dnd-kit`, `Tiptap`, `React PDF`, `Recharts`, `UploadThing` ou `Cloudinary` doivent passer par une PR dédiée.
- `Prisma` et `Neon` sont la base DB officielle.
- `Auth.js` reste à arbitrer et ne doit pas bloquer la migration DB.
- `pnpm` reste à arbitrer : le repo utilise actuellement npm et `package-lock.json`.
- `PostHog` et `Sentry` sont pertinents plus tard, avec consentement RGPD.

## Règles base de données

- Prisma + Neon est la base DB officielle.
- Toute nouvelle donnée métier doit être pensée côté Prisma / PostgreSQL.
- Aucune nouvelle feature ne doit créer de modèle Mongoose.
- Toute PR DB doit vérifier les règles Prisma dans `docs/database/PRISMA_DATA_LAYER.md` et `docs/database/NEON_CUTOVER_PLAN.md`.
- Ne pas réintroduire MongoDB / Mongoose.
- Ne pas mélanger DB avec routing français, UX/UI ou Stripe.
- Les nouveaux services doivent être pensés pour Prisma / PostgreSQL.
- Les routes API doivent rester minces et déléguer aux services serveur.

## Règles Stripe

- Ne pas modifier Stripe sans demande explicite.
- Le webhook Stripe est la source fiable de création d'inscription après paiement.
- Ne pas utiliser `req.json()` dans le webhook Stripe.
- Ne pas modifier prix, catalogue ou logique checkout sans PR dédiée.

## Règles RGPD

- Minimiser les données collectées.
- Prévoir export, suppression et consentement.
- Ne pas ajouter d'analytics sans consentement documenté.
- Ne pas exposer de données personnelles dans logs ou erreurs visibles.

## Règles PR

Chaque PR doit avoir :

- un objectif unique ;
- une liste claire des fichiers modifiés ;
- un risque estimé ;
- une checklist de validation ;
- les commandes lancées ;
- un résumé final.

Les PR doivent suivre la demande utilisateur la plus récente et les documents stables dans `docs/`.

Quand une PR est terminée et que `npm run lint` et `npm run build` sont OK :

- vérifier `git status` ;
- vérifier que `.next` n'est pas inclus ;
- stage uniquement les fichiers de la PR ;
- créer un commit clair ;
- donner le hash du commit ;
- mettre à jour le document stable concerné dans `docs/` si la PR change une décision durable.

Ne jamais stage `.next`. Ne jamais inclure un fichier hors périmètre sans le signaler.

## Commandes de validation

Utiliser les commandes disponibles dans `package.json`.

Commandes connues :

```bash
npm run lint
npm run build
```

Si un script `typecheck` est ajouté plus tard, l'utiliser aussi :

```bash
npm run typecheck
```

## Avant de terminer une tâche

Toujours fournir :

- fichiers créés ;
- fichiers modifiés ;
- fichiers supprimés ;
- commandes lancées ;
- résultat des commandes ;
- confirmation qu'aucun fichier hors périmètre n'a été inclus ;
- points à vérifier manuellement ;
- hash du commit si demandé ;
- prochaine PR recommandée.
