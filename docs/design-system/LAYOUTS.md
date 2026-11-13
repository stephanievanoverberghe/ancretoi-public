# Layouts responsive

UI2 introduit les structures globales sans refondre les pages. UI2B centralise les routes, les liens de navigation et la copy statique des shells pour éviter les répétitions avant la refonte page par page. UI2C fait évoluer les zones globales vers une logique de plateforme de formation. UI2D stabilise le polish premium et les drawers mobile avec Radix Dialog.

## Structure

| Zone | Dossier | Rôle |
|---|---|---|
| Public | `src/components/layout/public` | Header, footer, menu mobile, menu compte. |
| Espace apprenant | `src/components/layout/app` | Shell applicatif pleine largeur, sidebar desktop, topbar, bottom nav mobile. |
| Administration | `src/components/layout/admin` | Shell applicatif pleine largeur, topbar, sidebar CMS desktop, drawer mobile. |

`src/app` reste route-level : les layouts Next.js assemblent les shells, mais ne portent pas de rendu de navigation complexe.

## Sources

| Source | Rôle |
|---|---|
| `src/config/routes.ts` | Chemins visibles et builders de routes. |
| `src/config/navigation.ts` | Labels, groupes, ordre, icônes et visibilité des navigations. |
| `src/content/layout.ts` | Copy statique de header, footer, topbars et shells. |
| `src/lib/navigation.ts` | Helpers client-safe de navigation, par exemple l'état actif. |

## Public

- Header sticky, responsive, avec navigation desktop et drawer mobile basé sur Radix Dialog.
- Menu compte isolé côté client.
- CTA auth visibles sur desktop et mobile.
- Footer structuré par sections : parcours, ressources, compte et liens légaux.
- Footer contextuel : les liens connexion/inscription disparaissent quand une session existe, et l'accueil apprenant apparaît seulement pour un compte connecté.
- Desktop, mobile et footer lisent les mêmes sources de navigation.
- Le chrome public est isolé dans `PublicChrome` et n'est pas rendu dans l'espace apprenant ou l'administration.

## Espace apprenant

- Navigation desktop en sidebar pleine hauteur, collée au bord gauche du viewport.
- Topbar applicative avec contexte courant, CTA de reprise, compte et notifications.
- Le CTA `Reprendre` n'apparaît que si l'utilisateur a un parcours actif.
- Sans parcours actif, les CTA orientent vers le catalogue public et `/espace` explique que les onglets payants sont verrouillés.
- Navigation mobile basse avec zones tactiles stables.
- Le shell ne force pas de carte ou de largeur de contenu : chaque page reste responsable de son centrage.
- Les pages dashboard, journal, bilan et formations ne sont pas refaites dans UI2.
- Les liens espace viennent de `src/config/navigation.ts`.
- Aucun `max-w` ne limite le shell connecté : le contenu prend tout l'espace restant à droite de la sidebar.

## Administration

- Topbar admin interne au panneau contenu.
- Accès rapides admin : compte, notifications et déconnexion en topbar ; site public reste dans la sidebar, et l'espace apprenant n'y apparaît que si un parcours est actif.
- Le compte admin affiche l'avatar/initiale de l'utilisateur authentifié.
- Sidebar desktop persistante, pleine hauteur et collée au bord gauche du viewport.
- La sidebar desktop reste compacte et ne porte pas de scrollbar interne.
- Drawer mobile basé sur Radix Dialog, avec fermeture Escape, focus trap et retour focus gérés par la primitive.
- Les écrans CRUD et tableaux admin ne sont pas refaits dans UI2.
- La navigation admin est centralisée et n'est plus construite dans le layout Next.js.
- Les groupes admin suivent une logique CMS de plateforme : pilotage, contenu pédagogique, audience, opérations.

## Accessibilité

- Les menus mobiles exposent `aria-expanded`, `aria-controls`, `role="dialog"` et `aria-modal` via Radix Dialog.
- Escape ferme les drawers, menus et panneaux de notifications qui en ont besoin.
- Les drawers mobile public/admin utilisent Radix Dialog pour éviter les implémentations maison fragiles.
- Les liens actifs utilisent `aria-current="page"`.
- Les actions restent des boutons natifs.

## Prochaine étape

UI3 peut traiter les premières surfaces visibles de page : homepage, pages programmes ou dashboard apprenant, par lot limité. Les nouvelles pages doivent réutiliser les routes et liens centralisés au lieu de recréer des URLs locales.
