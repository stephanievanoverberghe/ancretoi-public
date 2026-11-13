# `src/server/programmes`

Services serveur du domaine programmes.

A mettre ici :

- lectures `Program` / `Unit` depuis Prisma / Neon ;
- regles de visibilite publique ;
- catalogue, comparatif et details programmes ;
- mappers Program/Unit ;
- seed canonique Program/Unit.

Fichiers principaux :

- `programmes.service.ts` : lectures publiques et helpers de mapping Prisma ;
- `programmes-index.service.ts` : compatibilite des anciens imports techniques ;
- `programmes-comparison.service.ts` : compatibilite comparatif ;
- `programmes.types.ts` : types serveur du domaine programmes ;
- `prisma-programmes.mapper.ts` : mapping seed canonique Program/Unit.

A ne pas mettre ici :

- composants React ;
- hooks client ;
- route handlers volumineux ;
- fallback DB temporaire.

Les routes visibles restent francaises. RESET-7 reste en 7 journees, sans matin/midi/soir.
