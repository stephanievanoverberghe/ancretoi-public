# Tests navigateur Playwright

## Objectif

Le filet E2E vérifie les routes visibles, le responsive, les métadonnées, les
préférences utilisateur, le consentement et l'accessibilité WCAG AA. Les
parcours connectés restent optionnels et n'utilisent que des comptes de test
déjà préparés.

## Installation locale

Les dépendances JavaScript sont installées avec le projet. Chromium doit être
installé une seule fois sur chaque poste ou runner :

```bash
npx playwright install chromium
```

Cette commande télécharge uniquement le navigateur Playwright. Elle n'est pas
lancée automatiquement par les scripts du projet.

## Commandes

```bash
npm run test:e2e
npm run test:e2e:headed
```

Pour cibler une largeur :

```bash
npm run test:e2e -- --project=chromium-390
```

Les cinq projets Chromium couvrent les largeurs 320, 390, 768, 1024 et 1440 px.
Le script construit d’abord l’application puis démarre le serveur Next.js de
production sur `http://127.0.0.1:3210`. Le port doit être libre : un serveur
existant n’est jamais réutilisé, afin d’éviter de valider une version obsolète.

## Couverture

- routes publiques, authentification et paiement ;
- canonical, `noindex` et redirection des routes protégées ;
- absence de débordement horizontal et de placeholders légaux ;
- audits Axe WCAG A/AA sur les pages critiques ;
- thème sombre, taille du texte, réduction des animations et lien d'évitement ;
- refus global et personnalisation du consentement ;
- smoke tests apprenant et administration quand les identifiants sont présents.

Les tests de paiement n'initient aucun checkout et les tests d'administration
n'effectuent aucune mutation métier.

## Parcours authentifiés

La configuration charge silencieusement `.env.local` avec `dotenv`. Les
variables déjà injectées par le shell ou la CI restent prioritaires. Les valeurs
ne sont jamais écrites dans les rapports. Traces, vidéos et captures sont
désactivées pour les scénarios authentifiés afin de ne pas enregistrer les
champs de connexion ni les requêtes associées.

Compte apprenant :

```dotenv
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
```

Compte administration :

```dotenv
TEST_ADMIN_EMAIL=
TEST_ADMIN_PASSWORD=
```

`ADMIN_EMAIL` et `ADMIN_PASSWORD` servent de repli pour le smoke test
administration. Si une paire est incomplète, le scénario correspondant apparaît
explicitement comme ignoré.

Utiliser uniquement les comptes préparés sur la branche Neon QA dédiée. La
suite ne crée pas de compte et ne prépare pas les données.

## Artefacts

Tous les artefacts sont placés sous `output/playwright/` et ignorés par Git :

- `test-results/` : traces, captures et vidéos conservées en cas d'échec ;
- `report/` : rapport HTML.

Le rapport local s'ouvre avec :

```bash
npx playwright show-report output/playwright/report
```
