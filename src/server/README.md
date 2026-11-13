# `src/server`

`src/server` contient la logique serveur de l'application.

A mettre ici :

- services metier serveur ;
- orchestration d'acces donnees ;
- logique partagee entre pages serveur et routes API ;
- helpers server-only ;
- integrations serveur comme Stripe, email, export et DB.

A ne pas mettre ici :

- composants React ;
- hooks client ;
- styles ;
- route handlers Next.js ;
- acces base de donnees hors services Prisma.

Structure cible :

- `administration` : analytics, statistiques, services admin.
- `apprentissage` : progression, entitlement, etat apprenant, prochain pas.
- `auth` : session, guards, auth serveur.
- `blog` : services articles/blog.
- `db` : clients DB, Prisma, connexions.
- `email` : envoi d'emails et templates serveur.
- `exports` : exports PDF/JSON ou exports apprenant.
- `newsletter` : logique newsletter serveur.
- `paiement` : Stripe, checkout, fulfillment, webhook.
- `programmes` : catalogue programmes, comparaison, mapping programmes.
- `security` : consentement, CSRF, rate limit, securite serveur.
- `shared` : utilitaires serveur transverses.
- `video` : video, assets, VTT, HLS si applicable.

Les anciens dossiers legacy `programs`, `checkout`, `learning` et `account` ne doivent pas etre recrees. Les routes visibles restent francaises. RESET-7 reste en 7 journees, sans matin/midi/soir.
