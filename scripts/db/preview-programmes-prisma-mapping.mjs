import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const programsDir = path.join(rootDir, 'src/data/programs');
const outputPath = path.join(rootDir, 'docs/refactor/PROGRAMS_PRISMA_DRY_RUN.md');

const PROGRAM_FILES = [
  { slug: 'reset-7', file: 'reset7.json' },
  { slug: 'boussole-10', file: 'boussole10.json' },
  { slug: 'ancrage-30', file: 'ancrage30.json' },
  { slug: 'alchimie-90', file: 'alchimie90.json' },
];

const LEGACY_BLOCK_NAMES = new Set(['morning', 'noon', 'evening']);

function mapProgramStatusToPrisma(status) {
  switch (status) {
    case 'published':
      return 'PUBLISHED';
    case 'preflight':
      return 'PREFLIGHT';
    case 'archived':
      return 'ARCHIVED';
    case 'draft':
    default:
      return 'DRAFT';
  }
}

function mapUnitStatusToPrisma(status) {
  switch (status) {
    case 'published':
      return 'PUBLISHED';
    case 'archived':
      return 'ARCHIVED';
    case 'draft':
    default:
      return 'DRAFT';
  }
}

function mapProgramLevelToPrisma(level) {
  switch (level) {
    case 'Basique':
      return 'BASIQUE';
    case 'Cible':
      return 'CIBLE';
    case 'Premium':
      return 'PREMIUM';
    default:
      return null;
  }
}

function normalizePrice(price) {
  if (!price) return null;

  return {
    amountCents: price.amount_cents ?? price.amountCents ?? null,
    currency: price.currency ?? 'EUR',
    taxIncluded: price.tax_included ?? price.taxIncluded ?? true,
    compareAtCents: price.compare_at_cents ?? price.compareAtCents ?? null,
    stripePriceId: price.stripe_price_id ?? price.stripePriceId ?? null,
  };
}

function collectDayExercises(blocks) {
  return Object.values(blocks ?? {}).flatMap((section) => section?.exercises ?? []);
}

function mapProgramJsonToPrismaSeedInput(programJson, meta) {
  const days = programJson.days ?? [];
  const units = days.map((day) => {
    const exercises = collectDayExercises(day.blocks);
    const firstVideo = exercises.find((exercise) => exercise.media?.video)?.media?.video ?? '';
    const journalExercises = exercises.filter((exercise) => exercise.type === 'journal');

    return {
      programSlug: meta.slug,
      unitType: 'DAY',
      unitIndex: day.day,
      title: day.title,
      durationMin: meta.estMinutesPerDay ?? 20,
      mantra: '',
      videoUrl: firstVideo,
      contentParagraphs: [],
      content: {
        objectives: day.objectives ?? [],
        outcomes: day.outcomes ?? [],
        exercises,
        sourceBlocks: Object.keys(day.blocks ?? {}),
      },
      journalSchema: journalExercises.length ? { exercises: journalExercises } : null,
      validationSchema: day.daily_check ?? null,
      status: mapUnitStatusToPrisma(meta.status === 'published' ? 'published' : 'draft'),
    };
  });

  return {
    program: {
      slug: meta.slug,
      title: meta.title ?? programJson.product,
      subtitle: null,
      description: null,
      coverUrl: meta.coverUrl ?? null,
      level: mapProgramLevelToPrisma(meta.level),
      status: mapProgramStatusToPrisma(meta.status),
      durationDays: meta.durationDays ?? days.length,
      estMinutesPerDay: meta.estMinutesPerDay ?? 20,
      unitsCount: units.length,
      category: null,
      tags: [],
      language: 'fr',
      hero: null,
      card: null,
      meta: {
        version: programJson.version ?? null,
        timezone: programJson.timezone ?? null,
      },
      marketing: null,
      highlights: null,
      curriculum: days.map((day) => ({ label: day.title, summary: '' })),
      faq: null,
      seo: null,
      price: normalizePrice(meta.price),
      metadata: {
        source: 'ProgramJSON',
        createdAt: programJson.created_at ?? null,
        updatedAt: programJson.updated_at ?? null,
      },
    },
    units,
  };
}

async function readJson(relativePath) {
  const raw = await readFile(path.join(programsDir, relativePath), 'utf8');
  return JSON.parse(raw);
}

function getIndexMeta(indexJson, slug) {
  return indexJson.programs.find((program) => program.slug === slug) ?? null;
}

function getCompareMeta(compareJson, slug) {
  return compareJson.rows.find((row) => row.slug === slug) ?? null;
}

function hasLegacyBlocks(programJson) {
  return (programJson.days ?? []).some((day) => Object.keys(day.blocks ?? {}).some((blockName) => LEGACY_BLOCK_NAMES.has(blockName)));
}

function getBlockNames(programJson) {
  return Array.from(new Set((programJson.days ?? []).flatMap((day) => Object.keys(day.blocks ?? {})))).sort();
}

function summarizeUnits(units) {
  const unitsWithoutVideo = units.filter((unit) => !unit.videoUrl).map((unit) => unit.unitIndex);
  const unitsWithoutJournal = units.filter((unit) => !unit.journalSchema).map((unit) => unit.unitIndex);
  const unitsWithoutMantra = units.filter((unit) => !unit.mantra).map((unit) => unit.unitIndex);
  const duplicateIndexes = findDuplicates(units.map((unit) => unit.unitIndex));

  return {
    unitsWithoutVideo,
    unitsWithoutJournal,
    unitsWithoutMantra,
    duplicateIndexes,
    unitIndexes: units.map((unit) => unit.unitIndex),
  };
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return Array.from(duplicates);
}

function formatMaybeList(values) {
  return values.length ? values.join(', ') : 'aucun';
}

function formatPrice(price) {
  if (!price || price.amountCents === null) return 'non défini';
  return `${price.amountCents} ${price.currency ?? 'EUR'} cents`;
}

function buildWarnings({ slug, indexMeta, compareMeta, programJson, mapped, unitSummary }) {
  const warnings = [];
  const blockNames = getBlockNames(programJson);

  if (!indexMeta) warnings.push('Métadonnées absentes de `index.json`.');
  if (!compareMeta) warnings.push('Ligne absente de `compare.json`.');
  if (!mapped.program.title) warnings.push('Titre manquant.');
  if (!mapped.program.status) warnings.push('Statut manquant.');
  if (!mapped.program.price || mapped.program.price.amountCents === null) warnings.push('Prix absent ou non défini.');
  if (!mapped.program.seo) warnings.push('SEO non disponible dans les JSON détaillés.');
  if (!mapped.units.length) warnings.push('Aucune unité détectée.');
  if (unitSummary.duplicateIndexes.length) warnings.push(`Unités dupliquées : ${formatMaybeList(unitSummary.duplicateIndexes)}.`);
  if (unitSummary.unitsWithoutVideo.length) warnings.push(`Unités sans vidéo principale : ${formatMaybeList(unitSummary.unitsWithoutVideo)}.`);
  if (unitSummary.unitsWithoutJournal.length) warnings.push(`Unités sans journalSchema : ${formatMaybeList(unitSummary.unitsWithoutJournal)}.`);
  if (unitSummary.unitsWithoutMantra.length) warnings.push(`Mantras absents : ${formatMaybeList(unitSummary.unitsWithoutMantra)}.`);
  if (blockNames.some((name) => LEGACY_BLOCK_NAMES.has(name))) warnings.push(`Blocs legacy détectés et aplatis : ${blockNames.join(', ')}.`);
  if (slug === 'reset-7' && mapped.units.length !== 7) warnings.push(`RESET-7 doit produire 7 journées, reçu ${mapped.units.length}.`);
  if (slug === 'ancrage-30' && programJson.product !== 'ANCRAGE-30') warnings.push('Nom public ANCRAGE-30 à vérifier.');

  return warnings;
}

function buildProgramSection(result) {
  const { slug, indexMeta, compareMeta, mapped, blockNames, unitSummary, warnings } = result;
  const marketingDetected = [
    indexMeta?.tagline ? 'index.tagline' : null,
    indexMeta?.card_highlights?.length ? 'index.card_highlights' : null,
    indexMeta?.detail ? 'index.detail' : null,
    compareMeta ? 'compare.row' : null,
  ].filter(Boolean);
  const jsonKept = ['Program.meta', 'Program.price', 'Program.metadata', 'Program.curriculum', 'Unit.content', 'Unit.journalSchema', 'Unit.validationSchema'];

  return `### ${mapped.program.title} (${slug})

| Champ | Valeur |
|---|---|
| Slug | \`${slug}\` |
| Statut Prisma | \`${mapped.program.status}\` |
| Niveau Prisma | ${mapped.program.level ? `\`${mapped.program.level}\`` : 'non mappé'} |
| Unités détectées | ${mapped.units.length} |
| dayIndex produits | ${formatMaybeList(unitSummary.unitIndexes)} |
| durationDays | ${mapped.program.durationDays} |
| estimatedMinutesPerDay | ${mapped.program.estMinutesPerDay} |
| Prix | ${formatPrice(mapped.program.price)} |
| Blocs source | ${formatMaybeList(blockNames)} |
| Marketing détecté | ${formatMaybeList(marketingDetected)} |
| SEO détecté | ${mapped.program.seo ? 'oui' : 'non'} |
| JSON conservés | ${jsonKept.join(', ')} |

Warnings :

${warnings.map((warning) => `- ${warning}`).join('\n') || '- Aucun warning.'}
`;
}

function buildReport(results) {
  const generatedAt = new Date().toISOString();
  const allWarnings = results.flatMap((result) => result.warnings.map((warning) => `${result.slug}: ${warning}`));
  const reset = results.find((result) => result.slug === 'reset-7');

  return `# Dry-run mapping programmes vers Prisma

Généré le ${generatedAt}.

Ce rapport est produit localement par \`scripts/db/preview-programmes-prisma-mapping.mjs\`.

Garanties :

- aucune connexion Prisma ;
- aucun import base de donnees legacy ;
- aucune écriture DB ;
- aucune migration ;
- aucune bascule des lectures publiques.

Limite : le repo n'a pas de runner TypeScript dédié. Le script \`.mjs\` réplique les règles pures des mappers DB4A pour les JSON locaux, sans importer directement les fichiers \`.ts\`.

## Résumé

| Programme | Statut | Unités | Prix | Warnings |
|---|---:|---:|---:|---:|
${results.map((result) => `| \`${result.slug}\` | \`${result.mapped.program.status}\` | ${result.mapped.units.length} | ${formatPrice(result.mapped.program.price)} | ${result.warnings.length} |`).join('\n')}

## RESET-7 V1

- Journées produites : ${reset?.mapped.units.length ?? 0}
- Cible validée : 7 journées.
- Unités produites : ${formatMaybeList(reset?.unitSummary.unitIndexes ?? [])}
- Blocs \`morning/noon/evening\` : détectés comme legacy et aplatis dans \`Unit.content.sourceBlocks\`.
- Aucune unité matin/midi/soir n'est produite.
- Aucune logique \`MOR\`, \`MID\`, \`EVE\` n'est produite.

## Programmes analysés

${results.map(buildProgramSection).join('\n')}

## Warnings consolidés

${allWarnings.map((warning) => `- ${warning}`).join('\n') || '- Aucun warning.'}

## Risques avant seed Prisma

- Les JSON détaillés portent encore une structure legacy \`morning/noon/evening\`, non retenue pour RESET-7 V1.
- Les mantras ne sont pas disponibles dans les JSON détaillés actuels et restent vides dans les unités produites.
- Les champs SEO complets ne viennent pas des JSON détaillés ; ils devront venir de \`ProgramPage\` ou d'un enrichissement seed.
- \`ancrage-30\` est cohérent côté slug et nom public ; ne pas créer \`ancre-30\`.
- Les prix \`ancrage-30\` et \`alchimie-90\` sont absents car ces programmes restent en draft / structure future.

## Prochaine étape recommandée

DB4C doit être précédée d'une validation explicite de la stratégie de seed. Aucun seed Neon ne doit être lancé à partir de ce rapport sans accord.
`;
}

async function main() {
  const [indexJson, compareJson] = await Promise.all([readJson('index.json'), readJson('compare.json')]);
  const results = [];

  for (const programFile of PROGRAM_FILES) {
    const programJson = await readJson(programFile.file);
    const indexMeta = getIndexMeta(indexJson, programFile.slug);
    const compareMeta = getCompareMeta(compareJson, programFile.slug);
    const mapped = mapProgramJsonToPrismaSeedInput(programJson, {
      slug: programFile.slug,
      title: indexMeta?.title ?? programJson.product,
      status: indexMeta?.status ?? 'draft',
      level: indexMeta?.level,
      durationDays: indexMeta?.duration_days ?? programJson.days?.length,
      estMinutesPerDay: parseDailyMinutes(compareMeta?.charge) ?? undefined,
      coverUrl: indexMeta?.cover,
      price: indexMeta?.price,
    });
    const unitSummary = summarizeUnits(mapped.units);
    const blockNames = getBlockNames(programJson);
    const warnings = buildWarnings({
      slug: programFile.slug,
      indexMeta,
      compareMeta,
      programJson,
      mapped,
      unitSummary,
    });

    results.push({
      slug: programFile.slug,
      indexMeta,
      compareMeta,
      mapped,
      blockNames,
      unitSummary,
      warnings,
      hasLegacyBlocks: hasLegacyBlocks(programJson),
    });
  }

  await writeFile(outputPath, buildReport(results), 'utf8');
  console.log(`Dry-run report written to ${path.relative(rootDir, outputPath)}`);
}

function parseDailyMinutes(label) {
  if (!label) return null;
  const matches = [...String(label).matchAll(/\d+/g)].map((match) => Number(match[0])).filter(Number.isFinite);
  if (!matches.length) return null;
  return Math.round(matches.reduce((sum, value) => sum + value, 0) / matches.length);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
