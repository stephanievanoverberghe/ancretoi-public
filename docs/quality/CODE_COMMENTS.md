# Commentaires et JSDoc

## Principe

Le code doit rester lisible sans commentaires decoratifs. Un commentaire utile explique une decision, une contrainte ou un contrat qui n'est pas evident a la lecture du code.

## Commentaires interdits

- Commentaires qui repetent le code.
- Commentaires de debug ou traces temporaires.
- Commentaires morts qui decrivent une ancienne implementation.
- Commentaires de type `NEW`, `TODO` vague ou note personnelle non actionnable.
- Commentaires qui remplacent un nom de fonction ou de variable clair.

## Commentaires autorises

- Decisions techniques non evidentes.
- Contraintes d'accessibilite ou de securite.
- Contournements lies a une limite de framework, navigateur ou dependance.
- Regles metier sensibles.
- Conditions de compatibilite ou de migration encore actives.

## Quand utiliser JSDoc

Utiliser une JSDoc courte pour :

- helpers reutilisables ;
- composants publics du design system avec contrat d'usage ;
- services ou fonctions avec effets de bord ;
- fonctions dont les parametres ou garanties ne sont pas evidents ;
- contraintes de securite, accessibilite ou donnees.

Ne pas ajouter de JSDoc automatique partout. Un type TypeScript clair suffit pour les fonctions simples.

## Regle pratique

Avant d'ajouter un commentaire, verifier qu'un meilleur nom, un type plus clair ou une extraction plus petite ne resout pas le probleme plus proprement.
