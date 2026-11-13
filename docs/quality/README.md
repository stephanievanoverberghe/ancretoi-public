# Quality

## Scripts

```bash
npm run check:prisma-boundaries
npm run test:prisma-data
npm run test:prisma-functional
npm run test:prisma-authenticated
npm run test:e2e
npm run test:e2e:headed
```

## Documents

- `AUTHENTICATED_SMOKE_TESTS.md` : donnees de test controlees et smoke tests authentifies.
- `QA1_SMOKE_TESTS.md` : branche Neon dediee, donnees QA et resultats.
- `CODE_COMMENTS.md` : convention commentaires et JSDoc.
- `E2E_PLAYWRIGHT.md` : tests navigateur, viewports, accessibilite et donnees optionnelles.

Les tests Playwright démarrent Next.js sur le port 3210 et conservent leurs
artefacts sous `output/playwright/`.
