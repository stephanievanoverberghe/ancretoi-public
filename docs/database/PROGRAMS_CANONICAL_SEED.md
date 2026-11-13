# Seed canonique programmes

## Decision

Neon/Prisma est la source canonique pour les programmes. Mongo n'est pas une source a recopier.

## Programmes attendus

- `reset-7` : publie, 7 unites DAY, aucun bloc `MOR`, `MID`, `EVE`.
- `boussole-10` : present selon contenu valide.
- `ancrage-30` : present comme programme futur si contenu valide.
- `alchimie-90` : present comme programme futur si contenu valide.

## Regles RESET-7

- 7 jours.
- 1 unite par jour.
- Pas de matin/midi/soir.
- Les donnees de seed ne doivent pas inventer de contenu produit non valide.

## QA

Les donnees de test connectees doivent etre creees uniquement sur une branche Neon dediee avec les garde-fous documentes dans `docs/quality`.
