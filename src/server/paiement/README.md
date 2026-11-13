# `src/server/paiement`

Services serveur du paiement.

A mettre ici :

- Stripe ;
- client Stripe serveur (`stripe.ts`) ;
- checkout ;
- fulfillment ;
- webhook ;
- idempotence ;
- acces achat.

A ne pas mettre ici :

- composants UI ;
- prix inventes ;
- refonte Stripe hors PR dediee ;
- changement de payload webhook non demande.

Le dossier legacy `src/server/checkout` a ete supprime. Les routes visibles restent francaises. RESET-7 reste en 7 journees, sans matin/midi/soir.

## Test manuel du webhook Stripe

Objectif : verifier que `checkout.session.completed` cree ou retrouve l'inscription sans dependre du retour navigateur.

Variables necessaires :

- `STRIPE_SECRET_KEY` ;
- `STRIPE_WEBHOOK_SECRET` ;
- `DATABASE_URL` pour ecrire `Purchase` et `Enrollment` via Prisma ;
- URL locale, generalement `http://localhost:3000`.

Flux recommande :

1. Verifier qu'un programme publie payant existe.
2. Verifier qu'un utilisateur de test existe et peut se connecter.
3. Desactiver `CHECKOUT_DEV_BYPASS`.
4. Demarrer l'app.
5. Lancer `stripe listen --events checkout.session.completed --forward-to localhost:3000/api/stripe/webhook`.
6. Acheter un programme avec une carte de test Stripe.
7. Verifier que le webhook repond `200`.
8. Verifier qu'un seul `Enrollment` existe pour `{ userId, programSlug }` et que le `Purchase` Stripe est marque `PAID`.

Cette procedure ne change pas la logique Stripe.
