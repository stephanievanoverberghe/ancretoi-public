# `src/features/auth`

Ce dossier accueillera la logique liée à l'authentification côté interface et domaine.

À mettre ici :

- composants de login/register ;
- types et schémas de formulaire auth ;
- helpers UI liés à l'auth.

À ne pas mettre ici :

- logique JWT serveur centrale ;
- cookies de session ;
- route handlers `src/app/api/auth`.

La migration se fera PR par PR, sans modifier le comportement de login/register tant que les routes n'ont pas été stabilisées.
