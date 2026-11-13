# `src/server/shared`

Utilitaires serveur transverses.

A mettre ici :

- helpers serveur sans domaine metier evident ;
- validations serveur partagees ;
- format de reponses API partage ;
- petites fonctions pures utilisables uniquement cote serveur.

A ne pas mettre ici :

- services metier ;
- clients DB ;
- logique Stripe ;
- composants React ;
- code client.

Ne pas creer de barrel global `src/server/index.ts`.
