# `src/app/(espace)`

Route group cible pour l'espace apprenant. Le segment `(espace)` organise le code mais n'apparaît pas dans l'URL.

À mettre ici plus tard :

- `/espace` ;
- `/espace/continuer` ;
- `/espace/formations` ;
- pages jour RESET-7 ;
- journal, notes, ressources, bilan, compte.

À ne pas mettre ici :

- administration ;
- routes publiques marketing ;
- logique métier serveur lourde.

Les pages doivent rester minces et appeler `src/features` ou `src/server`. Les routes visibles restent françaises. RESET-7 reste en 7 journées, sans matin/midi/soir.
