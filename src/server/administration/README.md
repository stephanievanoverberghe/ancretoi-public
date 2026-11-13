# `src/server/administration`

Services serveur pour l'administration.

A mettre ici :

- lectures serveur pour dashboards administration ;
- analytics admin ;
- services metier admin appeles par les pages ou routes API ;
- acces Prisma/Neon du domaine administration.

A ne pas mettre ici :

- composants React ;
- hooks client ;
- logique UI ;
- payloads API modifies sans PR dediee.

Neon/Prisma est la base principale. Les pages et composants administration ne doivent pas importer directement le client Prisma.
