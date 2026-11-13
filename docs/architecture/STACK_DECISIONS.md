# Decisions stack

## Etat courant

- Next.js App Router.
- React 19.
- Tailwind CSS v4.
- Prisma + Neon comme DB principale.
- Stripe pour le paiement.
- React Hook Form et Zod disponibles pour formulaires/validation.
- Lucide React disponible pour les icones.

## Regles

- Ne pas installer de dependance sans PR dediee.
- Ne pas reintroduire Mongo/Mongoose.
- Introduire les bibliotheques UI progressivement.
- Ne pas installer Playwright/QA navigateur sans PR QA dediee.
- Les composants doivent rester compatibles mobile-first et accessibles.

## Pistes futures

- `shadcn/ui` ou Radix peuvent etre introduits progressivement pour les primitives accessibles.
- TanStack Table peut etre pertinent pour l'administration.
- TanStack Query reste reserve aux zones client dynamiques.
- Sentry/PostHog restent des sujets separes avec consentement RGPD.
