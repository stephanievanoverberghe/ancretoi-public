# Conventions de nommage

## Domaines

- Les domaines produit utilisent le francais : `programmes`, `apprentissage`, `paiement`, `administration`, `espace`.
- Les noms anglais restent acceptes pour les conventions techniques : `webhook`, `JWT`, `CSRF`, `Stripe`.
- Ne pas maintenir deux dossiers concurrents pour un meme domaine.

## Fichiers UI

| Role | Convention |
|---|---|
| Orchestrateur de page | `*Page.tsx` |
| Section | `*Section.tsx` |
| Carte | `*Card.tsx` |
| Formulaire | `*Form.tsx` |
| Modale | `*Modal.tsx` |
| Barre d'outils | `*Toolbar.tsx` |
| Vue tableau | `*TableView.tsx` |
| Vue cartes | `*CardsView.tsx` |

Eviter les noms vagues comme `Main`, `Block`, `Wrapper`, `Content` ou `Client` sans contexte metier clair.

## Fichiers data et helpers

| Role | Convention |
|---|---|
| Types | `*.types.ts` |
| Utils purs | `*.utils.ts` |
| Constantes | `*.constants.ts` |
| Mappers | `*.mapper.ts` |
| Schemas | `*.schema.ts` |
| Repositories Prisma | `*.repository.ts` |
| Services serveur | `*.service.ts` |
| Server actions wrapper | `*.actions.ts` |

## Index

- Les `index.ts` sont locaux et explicites.
- Pas de barrel global `src/features/index.ts` ou `src/server/index.ts`.
- Ne pas melanger client et server dans un meme index.
- Ne pas creer d'index dans `src/app`.
