# Documentation Ancre-toi

La documentation stable vit maintenant dans des dossiers par responsabilite. L'ancien dossier `docs/refactor` etait un historique de PR ; il a ete retire pour eviter les plans obsoletes.

## Index

| Dossier | Role |
|---|---|
| `docs/architecture` | Decisions produit, conventions de nommage, architecture applicative. |
| `docs/database` | Cutover Neon/Prisma, couche data, variables d'environnement. |
| `docs/quality` | Scripts de verification et smoke tests QA. |
| `docs/design-system` | Tokens, theme et conventions UI. |

## Regles

- Les documents doivent decrire l'etat courant, pas l'historique PR par PR.
- Les secrets restent hors documentation.
- Les plans temporaires doivent etre supprimes ou synthetises une fois valides.
- Les decisions produit durables doivent etre ajoutees dans `docs/architecture/DECISIONS.md`.
