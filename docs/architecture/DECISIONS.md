# Decisions produit et techniques

## Sources de verite

1. La demande utilisateur la plus recente.
2. Les decisions documentees ici.
3. Les documents Google Drive Ancre-toi.
4. Le code existant, quand il ne contredit pas les decisions validees.

## Routes

- Les routes visibles utilisateur sont en francais, en kebab-case et sans accents.
- Les route groups Next.js restent internes : `(public)`, `(auth)`, `(espace)`, `(administration)`.
- Les APIs techniques peuvent rester en anglais.
- Les nouvelles routes visibles doivent passer par `src/config/routes.ts` quand elles sont referencees par la navigation ou la metadata.

## Architecture applicative

- `src/app` reste route-level : pages, layouts, route handlers, metadata.
- `src/features` porte les orchestrateurs de page et l'UI metier.
- `src/components` contient uniquement l'UI transverse, le layout et les etats communs.
- `src/server` contient les services serveur, repositories, mappers et logique metier serveur.
- `src/lib` reste limite aux utilitaires purs ou client-safe.
- `src/config` contient routes, navigation, options globales et SEO transverse.
- `src/content` contient les contenus statiques.
- `prisma/schema.prisma` est la source des modeles DB.

## Base de donnees

- Neon/Prisma est la base principale.
- Mongo/Mongoose ne doit pas revenir dans le code actif.
- Les appels Prisma applicatifs passent par `src/server/db/prisma.ts`.
- Les composants React ne doivent jamais importer Prisma ni `@/server`.

## RESET-7

RESET-7 V1 est un programme de 7 jours :

- 7 journees ;
- 1 unite par jour ;
- pas de logique matin/midi/soir ;
- pas de blocs `MOR`, `MID`, `EVE`.

## UI

- La refonte UI repart par fondations : tokens, design system, composants de base, layouts, puis surfaces.
- La phase UI ne doit pas modifier la logique DB, les routes API ou les payloads.
- Le design system utilise des tokens semantiques documentes dans `docs/design-system/TOKENS.md`.

### Refonte UI/UX espace et administration (2026-07-30)

- Les surfaces espace et administration utilisent les tokens semantiques et les primitives communes.
- Les listes d'administration affichent des cartes sur mobile et des tableaux uniquement aux largeurs adaptees.
- Les etats `loading`, `error`, `empty` et `not-found` sont explicites sur les zones principales.
- Le prochain pas utile du parcours actif reste prioritaire dans l'espace apprenant.
- Le journal canonique est `/espace/journal`; `/espace/notes` reste une destination distincte tant que sa fusion n'est pas decidee.
- Le plan post-parcours canonique est `/espace/plan-30-jours`.

## Authentification visible

- Les entrees canoniques sont `/connexion`, `/inscription`, `/mot-de-passe-oublie` et `/reinitialiser-mot-de-passe`.
- Le parametre `next` conserve la destination demandee apres authentification.
- Les dialogues du header peuvent reutiliser les memes formulaires, mais ne remplacent pas ces URLs partageables et accessibles.

### Direction "Elan studio" (2026-07)

- Le site est clair par defaut : `data-theme="light"` est pose sur `<html>` dans le layout racine. La preference utilisateur (espace compte) reste appliquee cote client par-dessus.
- Palette : violet vif (`--primary`) + corail (`--secondary`) sur fond chaud presque blanc. La palette `secondary-*` est un ramp corail ; le sauge n'est plus utilise.
- Les animations passent par `src/components/motion` (`Reveal`, `AnimatedNumber`), construits sur la librairie `motion` et respectant `prefers-reduced-motion`.
- Les codes e-learning sont assumes sur la partie publique : progression, badges de duree, apercus de l'espace apprenant, section fondatrice.
