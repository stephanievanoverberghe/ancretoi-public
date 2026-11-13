# `src/features/public/programmes`

Feature cible pour les composants et hooks metier lies aux programmes publics.

A mettre ici :

- cards programmes ;
- sections metier de la page catalogue `/programmes` ;
- sections metier des pages `/programmes/[slug]` ;
- grille programmes affichee sur la home ;
- helpers UI programmes ;
- types et schemas cote interface.

A ne pas mettre ici :

- services serveur de lecture ;
- acces Prisma direct ;
- route handlers ;
- composants UI generiques.

Structure :

- `cards/` : cartes programmes publiques ;
- `catalog/sections/` : sections de la page liste `/programmes` ;
- `detail/sections/` : sections des pages programme ;
- `home/` : grille programmes affichee sur l'accueil.

Les routes visibles restent francaises. RESET-7 reste en 7 journees, sans matin/midi/soir.
