# Navigation et contenus de layout

UI2B pose la séparation durable entre routes, navigation, contenu statique et rendu. UI2C ajoute une logique de plateforme de formation : navigation publique orientée programmes, espace apprenant avec sidebar et topbar applicative, administration groupée comme un CMS pédagogique.

## Responsabilités

| Zone | Fichier | Contenu |
|---|---|---|
| Routes | `src/config/routes.ts` | Chemins, builders, préfixes et routes visibles. |
| Navigation | `src/config/navigation.ts` | Labels, groupes, ordre, icônes et liens utilisés par header, footer, sidebars et topbars. |
| Copy statique | `src/content/layout.ts` | Textes de header, footer, CTA de layout, notifications et libellés ARIA. |
| Rendu | `src/components/layout/**` | Composants de header, footer, shells, topbars et menus. |
| Helpers | `src/lib/navigation.ts` | Fonctions pures client-safe, comme l'état actif. |

## Ajouter une route

1. Ajouter le chemin dans `src/config/routes.ts`.
2. Ajouter un builder si la route a des paramètres.
3. Ajouter la route aux listes de préfixes ou routes visibles si elle est visible utilisateur.
4. Ajouter un lien dans `src/config/navigation.ts` seulement si la route doit apparaître dans une navigation.

Les composants ne doivent pas inventer d'URL en dur pour une route visible partagée.

## Ajouter un lien de navigation

1. Réutiliser une route existante depuis `src/config/routes.ts`.
2. Ajouter le lien dans le groupe approprié de `src/config/navigation.ts`.
3. Ajouter une icône uniquement si la navigation concernée en a besoin.
4. Garder desktop, mobile, footer et sidebar alignés sur cette même source.

## Liens désactivés ou à venir

La navigation admin peut afficher des éléments structurants désactivés avec `disabled: true` et un badge, par exemple `Bientôt`.

Règles :

- ne pas créer de lien actif vers une page inexistante ;
- afficher les éléments à venir comme repères de structure uniquement ;
- ne pas les rendre focusables comme des liens ;
- documenter ou traiter la route réelle dans une PR dédiée.

## Zones connectées

`/espace` et `/administration` ne reprennent pas le header/footer publics. Ces zones utilisent leur propre shell applicatif pleine largeur :

- sidebar desktop collée au bord gauche du viewport ;
- topbar applicative pour le contexte, les accès rapides, le compte et les notifications ;
- contenu principal dans la colonne de droite ;
- bottom nav ou drawer mobile ;
- pas de `max-w` global sur le shell connecté.

La sidebar desktop reste compacte et ne doit pas porter de scrollbar interne dans le cas nominal. Si une navigation devient trop longue, il faut revoir le regroupement ou déplacer les accès secondaires plutôt que transformer la sidebar en liste infinie.

Règles de cohérence :

- afficher `Reprendre` seulement quand l'utilisateur a un parcours actif ;
- afficher `Accueil apprenant` à tout utilisateur connecté ;
- ne pas répéter le CTA `Voir les programmes` dans le header quand l'utilisateur est déjà connecté, car `Programmes` reste dans la navigation publique ;
- sinon orienter vers `/espace`, qui explique clairement que les onglets payants sont verrouillés ;
- dans le shell apprenant sans parcours actif, ne garder que `Accueil`, `Compte` et `Aide` ;
- afficher l'accès administration seulement quand le rôle serveur est admin ;
- les zones connectées utilisent l'avatar/initiale de l'utilisateur pour l'accès compte.

Ces règles de navigation ne remplacent pas le contrôle d'accès serveur. Les routes payantes de `/espace` sont verrouillées dans `src/server/espace/access.service.ts` et documentées dans `docs/architecture/ACCESS_CONTROL.md`.

## Footer public

Le footer public reste une surface de plateforme, pas une répétition exhaustive du header :

- `Aide` n'est pas dans la navigation principale desktop du header public ; il reste disponible dans le menu dépliant, le menu compte et le footer ;
- les liens légaux restent dans la barre légale basse ;
- le CTA newsletter reste dans le bloc d'appel ;
- les liens `Connexion` et `Inscription` sont masqués quand une session existe ;
- le lien `Accueil apprenant` est masqué pour les visiteurs non connectés, mais reste disponible pour les comptes connectés même sans parcours actif ;
- les icônes sociales ne répètent pas les liens de contact déjà présents dans les colonnes.

## Notifications

`NotificationBell` fournit aujourd'hui un panneau vide accessible. Il ne lit aucune donnée et ne contient aucune logique métier. Les vraies notifications devront être branchées par props ou par un service dédié dans une PR séparée.

## Ajouter un texte de header, topbar ou footer

Les textes éditoriaux et micro-copies de layout vont dans `src/content/layout.ts`. Les composants de layout doivent rester centrés sur le rendu, les états interactifs et l'accessibilité.

## Règles

- `routes.ts` ne contient pas de labels.
- `navigation.ts` ne contient pas de JSX.
- `content/layout.ts` ne contient pas de logique runtime.
- `src/components/layout` ne contient pas de requête DB, Prisma ou logique métier lourde.
- Les fichiers client peuvent gérer l'ouverture des menus, le focus et Escape, mais ne doivent pas importer `@/server`.

## Prochaine étape

UI3 peut commencer la refonte page par page en s'appuyant sur ces sources centralisées.
