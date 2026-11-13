# `src/server/email`

Services serveur email.

A mettre ici :

- envoi d'emails transactionnels ;
- templates email serveur ;
- reset password email ;
- integration future Resend ou autre fournisseur.

Contenu actuel :

- `mailer.ts` : stub no-op `sendPasswordResetEmail`, conserve pour ne pas changer le comportement existant.

A ne pas mettre ici :

- composants UI ;
- logique newsletter metier si elle appartient a `src/server/newsletter` ;
- secrets ou cles API.

`src/lib/email.ts` a ete supprime en ARCH7E car il etait vide. Aucun fournisseur email n'est ajoute dans cette PR.
