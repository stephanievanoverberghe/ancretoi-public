# `src/features/espace`

Ce dossier regroupe les features du route group `src/app/(espace)`.

A mettre ici :

- orchestrateurs de pages de l'espace apprenant ;
- composants metier lies au dashboard, aux formations, au journal, au bilan, aux ressources et au compte ;
- composants client directement lies a l'experience apprenant.

Sous-domaines actuels :

- `dashboard` ;
- `continuer` ;
- `formations` ;
- `journal` ;
- `bilan` ;
- `ressources` ;
- `compte` ;
- `components` pour les composants partages entre pages espace.

A ne pas mettre ici :

- route handlers API ;
- acces DB directs hors orchestrateurs serveur existants pendant la transition ;
- logique Stripe ;
- auth profonde, cookies, JWT ou sessions.

Les migrations se font PR par PR. RESET-7 reste en 7 journees, sans blocs matin/midi/soir.
