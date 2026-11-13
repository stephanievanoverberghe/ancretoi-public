# QA1 - Branche Neon dediee

## Verdict

QA1 a valide les parcours connectes essentiels sur une branche Neon isolee, sans ecriture sur Neon main.

| Element | Valeur |
|---|---|
| Projet Neon | `ancre-toi` / `cool-scene-50291726` |
| Branche | `qa1-smoke-tests` |
| Branch ID | `br-rough-resonance-asz2vesk` |
| Endpoint | `ep-holy-dawn-assitf1o` |
| Parent | `main` / `br-divine-mouse-as96tb1n` |
| Base | `neondb` |

## Resultats

- Schema a jour.
- `Program count = 4`.
- `Unit count = 137`.
- RESET-7 = 7 unites.
- `MOR/MID/EVE = 0`.
- User test, admin test, product, enrollment, DayState et achat simule crees uniquement sur QA.
- `npm run test:prisma-authenticated` avec donnees obligatoires : OK.

## Nettoyage

La branche `qa1-smoke-tests` peut etre supprimee apres validation si elle n'est utilisee par aucun environnement actif.

Ne jamais supprimer la branche Neon main depuis cette procedure.

## Limites

- Pas de navigateur automatise dans QA1.
- Pas de paiement Stripe reel.
- Pas d'ecriture admin dangereuse.
- QA2 pourra introduire un outillage E2E officiel.
