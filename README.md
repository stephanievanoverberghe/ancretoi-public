# Ancre-toi

Plateforme de formation en ligne qui réunit dans une seule application Next.js le **site public**, l'**espace apprenant** et le **back-office d'administration**.

**Démo :** [ancretoi.vercel.app](https://ancretoi.vercel.app)

> Ce dépôt est la copie publique d'un dépôt privé (plus de 300 commits). Les coordonnées et secrets ont été remplacés par des valeurs d'exemple.

## Fonctionnalités

**Site public**
- Catalogue de programmes, pages méthode, blog, inspirations et centre d'aide
- Contenus administrables, metadata SEO par route

**Espace apprenant**
- Inscription, connexion (email + mot de passe, Google OAuth) et mot de passe oublié
- Achat d'un programme via Stripe
- Parcours jour par jour, journal personnel, bilan et plan sur 30 jours

**Administration**
- Gestion des programmes, articles, catégories, inspirations et apprenants

## Stack

| Domaine | Outils |
| --- | --- |
| Front | Next.js (App Router), React, TypeScript, Tailwind CSS, Radix UI, Motion |
| Formulaires | React Hook Form, Zod |
| Données | PostgreSQL (Neon), Prisma |
| Auth | Sessions JWT (jose), bcrypt, Google OAuth |
| Paiement / email | Stripe, Resend |
| Qualité | ESLint, TypeScript, Playwright, axe-core |

## Architecture

```
src/
  app/         routes et metadata (groupes public / espace / administration)
  features/    orchestrateurs de pages et UI métier
  components/  primitives et layouts partagés
  server/      services serveur et accès aux données (seule couche qui parle à Prisma)
  config/      routes et navigation
  content/     contenus statiques
  styles/      tokens et styles globaux
prisma/        schéma PostgreSQL et migrations
docs/          décisions d'architecture, design system, base de données, qualité
```

Les choix techniques sont documentés dans [`docs/architecture/DECISIONS.md`](./docs/architecture/DECISIONS.md) et le design system dans [`docs/design-system/`](./docs/design-system/).

## Qualité

- **Tests E2E Playwright** : parcours publics, authentification, responsive et accessibilité (axe-core)
- **Script de contrôle d'architecture** : vérifie que Prisma n'est utilisé que dans la couche `server/`
- **Scripts de smoke tests** sur la couche de données

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e
```

## Lancer le projet en local

Prérequis : Node.js et une base PostgreSQL (Neon ou locale).

```bash
npm install
cp .env.local.example .env.local   # puis renseigner les variables
npx prisma migrate deploy
npm run dev                        # http://localhost:3000
```

## Ce que ce projet montre

- Concevoir un produit complet, du site vitrine au back-office
- Structurer une application Next.js en couches claires (routes, features, server)
- Intégrer paiement, emails et authentification
- Documenter les décisions et tester les parcours critiques
