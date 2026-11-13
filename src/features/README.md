# `src/features`

Ce dossier regroupe la logique metier par domaine fonctionnel.

A mettre ici :

- composants metier propres a un domaine ;
- hooks metier ;
- schemas de validation client-safe ;
- types de domaine UI ;
- helpers lies a une feature precise.

A ne pas mettre ici :

- routes Next.js ;
- route handlers ;
- acces base de donnees direct ;
- composants UI generiques ;
- services serveur partages.

Les dossiers de domaine utilisent les noms produit francais quand ils existent. Les anciens noms anglais ne doivent pas etre recrees.

Les routes visibles restent francaises. RESET-7 reste en 7 journees, sans matin/midi/soir. Le build doit rester stable a chaque deplacement.
