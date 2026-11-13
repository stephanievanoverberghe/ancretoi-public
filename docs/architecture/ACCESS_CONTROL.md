# Contrôle d'accès

## Principe

Masquer un lien dans l'UI ne suffit pas. Les routes protégées doivent être verrouillées côté serveur, dans `src/server`, puis appelées depuis les layouts ou pages route-level de `src/app`.

Les composants React et les fichiers `"use client"` ne doivent pas contenir de logique d'accès DB, d'appel Prisma ou d'import `@/server`.

## Espace apprenant

Toutes les routes `/espace` demandent une session utilisateur via le layout `(espace)`.

Routes connectées sans parcours payant :

| Route | Accès |
|---|---|
| `/espace` | utilisateur connecté, avec état explicite si aucun parcours n'est débloqué |
| `/espace/compte` | utilisateur connecté uniquement |

Routes payantes :

| Route | Accès |
|---|---|
| `/espace/continuer` | utilisateur connecté + entitlement programme |
| `/espace/formations` | utilisateur connecté + entitlement programme |
| `/espace/formations/[programme]` | utilisateur connecté + entitlement sur le programme |
| `/espace/formations/[programme]/jour/[jour]` | utilisateur connecté + entitlement sur le programme |
| `/espace/journal` | utilisateur connecté + entitlement programme |
| `/espace/notes` | utilisateur connecté + entitlement programme |
| `/espace/ressources` | utilisateur connecté + entitlement programme |
| `/espace/bilan` | utilisateur connecté + entitlement programme |
| `/espace/plan-30-jours` | utilisateur connecté + entitlement programme |

Un entitlement valide correspond aujourd'hui à un enrollment `ACTIVE` ou `COMPLETED`. Un parcours terminé reste donc accessible.

## Redirections

| Cas | Destination |
|---|---|
| inscription réussie | `/espace` |
| non connecté | `/connexion?next=...` |
| connecté sans parcours payant sur une route espace générale | `/espace?acces=formation-requise` |
| connecté sans entitlement sur un programme précis | page publique du programme |

Après inscription, l'utilisateur arrive toujours sur l'accueil apprenant `/espace`. Si aucun parcours n'est actif, cette page explique que les onglets de formation sont verrouillés et propose les programmes, le compte et l'aide.

## Administration

L'administration reste protégée par rôle admin via `requireAdmin`.

Un admin sans parcours payant garde l'accès à `/administration`. Il peut ouvrir l'accueil apprenant et le compte, mais ne doit pas accéder aux routes payantes de `/espace` hors exceptions connectées.

## Emplacement du guard

La logique centralisée vit dans :

- `src/server/espace/access.service.ts`

Les pages `src/app/(espace)` appellent ce service au niveau route, avant de charger les données métier.

## Prochaines étapes

- Ajouter une route `/espace/aide` si l'aide connectée devient nécessaire.
- Ajouter des tests d'intégration route-level quand un environnement QA avec données d'enrollment est disponible.
- Garder les checks RESET-7 dans les scripts Prisma existants : 7 unités DAY, aucun marqueur MOR/MID/EVE.
