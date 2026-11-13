# Variables d'environnement

## Variables principales

| Variable | Role |
|---|---|
| `DATABASE_URL` | URL Neon pooled pour Prisma runtime. |
| `DIRECT_URL` | URL Neon directe pour migrations et operations admin controlees. |
| `NEXTAUTH_SECRET` | Secret session/JWT applicatif. |
| `NEXTAUTH_URL` | URL publique de l'application. |
| `STRIPE_SECRET_KEY` | Cle serveur Stripe si paiement actif. |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Envoi email si SMTP actif. |

## Interdits

- Ne pas commiter `.env` ou `.env.local`.
- Ne pas documenter de secret reel.
- Ne pas reintroduire `MONGODB_URI`, `JWT_SECRET` ou `APP_URL` dans le code actif.

## Neon

- `DATABASE_URL` doit pointer vers l'endpoint pooled.
- `DIRECT_URL` doit pointer vers l'endpoint direct.
- Les branches de test Neon doivent etre utilisees pour les donnees QA ou smoke tests avec ecriture.
