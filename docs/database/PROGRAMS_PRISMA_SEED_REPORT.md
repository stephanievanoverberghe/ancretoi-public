# Rapport seed programmes Prisma

Genere le 2026-07-04T14:00:48.926Z.

## 1. Verdict

Seed programmes execute sur la branche Neon cible.

## 2. Cible

- Branche confirmee : main
- Branch ID : br-divine-mouse-as96tb1n
- Endpoint : ep-polished-silence-as3p7306
- Database : postgresql://ep-polished-silence-as3p7306-pooler.c-4.eu-central-1.aws.neon.tech/neondb
- Env files charges : .env.local, .env
- Mode : write
- Debut : 2026-07-04T14:00:44.657Z
- Fin : 2026-07-04T14:00:48.926Z

## 3. Garde-fous

- ALLOW_PRISMA_SEED=true : OK
- CONFIRM_NEON_MAIN_BRANCH=main : OK
- NODE_ENV production : OK
- DATABASE_URL endpoint test : OK
- DIRECT_URL endpoint test direct : OK
- Table Program : OK
- Table Unit : OK

## 4. Donnees source

- Programmes source : reset-7, boussole-10, ancrage-30, alchimie-90
- Programmes prevus : 4
- Unites prevues : 137
- RESET-7 : 7 unites

## 5. Resultat DB

| Mesure | Avant | Apres |
|---|---:|---:|
| Program count | 4 | 4 |
| Unit count | 137 | 137 |
| RESET-7 units | 7 | 7 |

- Boussole-10 present apres seed : oui
- Marqueurs techniques MOR/MID/EVE dans RESET-7 : 0

## 6. Details programmes

### reset-7

- Statut : PUBLISHED
- Unites : 7
- Action estimee : update

Warnings :

- SEO absent.
- journalSchema manquant: 1, 2, 3.
- Mantras absents: 1, 2, 3, 4, 5, 6, 7.
- Blocs legacy detectes et aplatis sans sourceBlocks: evening, morning, noon.

### boussole-10

- Statut : PUBLISHED
- Unites : 10
- Action estimee : update

Warnings :

- SEO absent.
- Videos absentes: 2, 3, 4, 5, 6, 7, 8, 9, 10.
- journalSchema manquant: 5, 8, 9.
- Mantras absents: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.
- Blocs legacy detectes et aplatis sans sourceBlocks: evening, morning, noon.

### ancrage-30

- Statut : DRAFT
- Unites : 30
- Action estimee : update

Warnings :

- SEO absent.
- Prix absent ou non defini.
- Videos absentes: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30.
- journalSchema manquant: 2, 3, 4, 6, 9, 10, 12, 15, 16, 18, 19, 20, 24, 27, 28, 29.
- Mantras absents: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30.
- Blocs legacy detectes et aplatis sans sourceBlocks: evening, morning, noon.

### alchimie-90

- Statut : DRAFT
- Unites : 90
- Action estimee : update

Warnings :

- SEO absent.
- Prix absent ou non defini.
- Videos absentes: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90.
- journalSchema manquant: 2, 4, 9, 11, 16, 18, 23, 25, 30, 32, 37, 39, 44, 46, 51, 53, 58, 60, 65, 67, 72, 74, 79, 81, 86, 88.
- Mantras absents: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90.
- Blocs legacy detectes et aplatis sans sourceBlocks: evening, morning, noon.


## 7. Limites

- Aucune donnee utilisateur n'est seedee.
- Aucune donnee achat, progression, journal, newsletter ou webhook n'est seedee.
- Neon / Prisma est la source canonique cible pour les programmes.
- Aucune bascule publique n'est faite.
- Les lectures programmes actives utilisent Prisma/Neon.
