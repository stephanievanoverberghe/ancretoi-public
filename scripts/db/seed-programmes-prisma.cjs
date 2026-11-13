/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const { readFile, writeFile } = require("node:fs/promises");
const Module = require("node:module");
const path = require("node:path");

const { neon } = require("@neondatabase/serverless");

const rootDir = path.resolve(__dirname, "../..");
const programsDir = path.join(rootDir, "src/data/programs");
const reportPath = path.join(rootDir, "docs/database/PROGRAMS_PRISMA_SEED_REPORT.md");

const TARGET_BRANCH_NAME = "main";
const TARGET_BRANCH_ID = "br-divine-mouse-as96tb1n";
const TARGET_ENDPOINT = "ep-polished-silence-as3p7306";

const PROGRAM_FILES = [
  { slug: "reset-7", file: "reset7.json" },
  { slug: "boussole-10", file: "boussole10.json" },
  { slug: "ancrage-30", file: "ancrage30.json" },
  { slug: "alchimie-90", file: "alchimie90.json" },
];

const LEGACY_BLOCK_NAMES = new Set(["morning", "noon", "evening", "MOR", "MID", "EVE"]);
const JSON_PROGRAM_FIELDS = [
  "hero",
  "card",
  "meta",
  "marketing",
  "highlights",
  "curriculum",
  "faq",
  "seo",
  "price",
  "metadata",
];
const JSON_UNIT_FIELDS = ["content", "journalSchema", "validationSchema"];

function loadEnvironment() {
  const dotenv = require("dotenv");
  const loaded = [];

  for (const fileName of [".env.local", ".env"]) {
    const envPath = path.join(rootDir, fileName);
    if (!fs.existsSync(envPath)) continue;
    dotenv.config({ path: envPath, override: false, quiet: true });
    loaded.push(fileName);
  }

  return loaded;
}

function registerRuntimeHooks() {
  const ts = require("typescript");
  const originalTsHook = require.extensions[".ts"];
  const originalResolve = Module._resolveFilename;

  require.extensions[".ts"] = function transpileTypeScript(module, filename) {
    const source = fs.readFileSync(filename, "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        isolatedModules: true,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: filename,
    }).outputText;

    module._compile(output, filename);
  };

  Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
    if ((request.startsWith("./") || request.startsWith("../")) && parent?.filename) {
      const basePath = path.resolve(path.dirname(parent.filename), request);
      const candidates = [basePath, `${basePath}.ts`, `${basePath}.js`, path.join(basePath, "index.ts")];
      const resolved = candidates.find((candidate) => fs.existsSync(candidate));
      if (resolved) {
        return originalResolve.call(this, resolved, parent, isMain, options);
      }
    }

    return originalResolve.call(this, request, parent, isMain, options);
  };

  return function restoreRuntimeHooks() {
    if (originalTsHook) {
      require.extensions[".ts"] = originalTsHook;
    } else {
      delete require.extensions[".ts"];
    }

    Module._resolveFilename = originalResolve;
  };
}

function getMode() {
  return process.argv.includes("--dry-run") || process.env.PRISMA_SEED_DRY_RUN === "true" ? "dry-run" : "write";
}

function parseDatabaseUrl(value) {
  if (!value) return null;

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function maskDatabaseUrl(value) {
  const parsed = parseDatabaseUrl(value);
  if (!parsed) return "absent ou non parse";
  return `${parsed.protocol.replace(":", "")}://${parsed.hostname}${parsed.pathname}`;
}

function assertSeedAllowed({ mode }) {
  const loadedEnvFiles = loadEnvironment();
  const databaseUrl = parseDatabaseUrl(process.env.DATABASE_URL);
  const directUrl = parseDatabaseUrl(process.env.DIRECT_URL);
  const errors = [];

  if (process.env.NODE_ENV === "production") {
    errors.push("NODE_ENV=production est interdit pour le seed programmes.");
  }

  if (!databaseUrl) {
    errors.push("DATABASE_URL est requis et doit etre parseable.");
  }

  if (!directUrl) {
    errors.push("DIRECT_URL est requis et doit etre parseable.");
  }

  if (databaseUrl && !databaseUrl.hostname.includes(TARGET_ENDPOINT)) {
    errors.push(`DATABASE_URL ne pointe pas vers l'endpoint Neon attendu ${TARGET_ENDPOINT}.`);
  }

  if (databaseUrl && !databaseUrl.hostname.includes("-pooler")) {
    errors.push("DATABASE_URL doit pointer vers l'URL pooled Neon de la branche cible.");
  }

  if (directUrl && !directUrl.hostname.includes(TARGET_ENDPOINT)) {
    errors.push(`DIRECT_URL ne pointe pas vers l'endpoint Neon attendu ${TARGET_ENDPOINT}.`);
  }

  if (directUrl && directUrl.hostname.includes("-pooler")) {
    errors.push("DIRECT_URL doit pointer vers l'URL directe Neon sans pooler.");
  }

  if (process.env.CONFIRM_NEON_MAIN_BRANCH !== TARGET_BRANCH_NAME) {
    errors.push(`CONFIRM_NEON_MAIN_BRANCH=${TARGET_BRANCH_NAME} est requis.`);
  }

  if (mode === "write" && process.env.ALLOW_PRISMA_SEED !== "true") {
    errors.push("ALLOW_PRISMA_SEED=true est requis pour ecrire en base.");
  }

  if (errors.length) {
    console.error("[seed-programmes] Seed refuse.");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return null;
  }

  return {
    loadedEnvFiles,
    databaseUrl: process.env.DATABASE_URL,
    maskedDatabaseUrl: maskDatabaseUrl(process.env.DATABASE_URL),
  };
}

async function readJson(relativePath) {
  const raw = await readFile(path.join(programsDir, relativePath), "utf8");
  return JSON.parse(raw);
}

function getIndexMeta(indexJson, slug) {
  return indexJson.programs.find((program) => program.slug === slug) ?? null;
}

function getCompareMeta(compareJson, slug) {
  return compareJson.rows.find((row) => row.slug === slug) ?? null;
}

function parseDailyMinutes(label) {
  if (!label) return null;
  const matches = [...String(label).matchAll(/\d+/g)]
    .map((match) => Number(match[0]))
    .filter(Number.isFinite);

  if (!matches.length) return null;

  return Math.round(matches.reduce((sum, value) => sum + value, 0) / matches.length);
}

function normalizeIndexPrice(price) {
  if (!price) return null;

  return {
    amountCents: price.amountCents ?? price.amount_cents ?? null,
    currency: price.currency ?? "EUR",
    taxIncluded: price.taxIncluded ?? price.tax_included ?? true,
    compareAtCents: price.compareAtCents ?? price.compare_at_cents ?? null,
    stripePriceId: price.stripePriceId ?? price.stripe_price_id ?? null,
  };
}

function getBlockNames(programJson) {
  return Array.from(new Set((programJson.days ?? []).flatMap((day) => Object.keys(day.blocks ?? {})))).sort();
}

function hasLegacyBlocks(programJson) {
  return getBlockNames(programJson).some((blockName) => LEGACY_BLOCK_NAMES.has(blockName));
}

function toPrismaJson(value) {
  if (value === null || value === undefined) return null;
  return JSON.parse(JSON.stringify(value));
}

function sanitizeUnitContent(unit) {
  const content = unit.content;
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return unit;
  }

  const cleanContent = { ...content };
  delete cleanContent.sourceBlocks;

  return {
    ...unit,
    content: cleanContent,
  };
}

function normalizeProgramData(program) {
  const data = { ...program };

  for (const field of JSON_PROGRAM_FIELDS) {
    data[field] = toPrismaJson(data[field]);
  }

  return data;
}

function normalizeUnitData(unit) {
  const data = sanitizeUnitContent({ ...unit });

  for (const field of JSON_UNIT_FIELDS) {
    data[field] = toPrismaJson(data[field]);
  }

  return data;
}

function buildWarnings({ slug, programJson, mapped }) {
  const warnings = [];
  const unitsWithoutVideo = mapped.units.filter((unit) => !unit.videoUrl).map((unit) => unit.unitIndex);
  const unitsWithoutJournal = mapped.units.filter((unit) => !unit.journalSchema).map((unit) => unit.unitIndex);
  const unitsWithoutMantra = mapped.units.filter((unit) => !unit.mantra).map((unit) => unit.unitIndex);
  const blockNames = getBlockNames(programJson);

  if (!mapped.program.seo) warnings.push("SEO absent.");
  if (!mapped.program.price || mapped.program.price.amountCents === null) warnings.push("Prix absent ou non defini.");
  if (unitsWithoutVideo.length) warnings.push(`Videos absentes: ${unitsWithoutVideo.join(", ")}.`);
  if (unitsWithoutJournal.length) warnings.push(`journalSchema manquant: ${unitsWithoutJournal.join(", ")}.`);
  if (unitsWithoutMantra.length) warnings.push(`Mantras absents: ${unitsWithoutMantra.join(", ")}.`);
  if (hasLegacyBlocks(programJson)) warnings.push(`Blocs legacy detectes et aplatis sans sourceBlocks: ${blockNames.join(", ")}.`);
  if (slug === "reset-7" && mapped.units.length !== 7) warnings.push(`RESET-7 doit produire 7 journees, recu ${mapped.units.length}.`);
  if (slug === "ancrage-30" && programJson.product !== "ANCRAGE-30") warnings.push("Nom public ANCRAGE-30 a verifier.");

  return warnings;
}

function assertProgramInvariants(slug, mapped) {
  if (slug === "reset-7" && mapped.units.length !== 7) {
    throw new Error("RESET-7 doit produire exactement 7 unites.");
  }

  for (const unit of mapped.units) {
    if (unit.unitType !== "DAY") {
      throw new Error(`${slug}: type unite interdit ${unit.unitType}.`);
    }
  }

  if (slug === "reset-7") {
    const dayIndexes = mapped.units.map((unit) => unit.unitIndex).sort((a, b) => a - b);
    const expected = [1, 2, 3, 4, 5, 6, 7];

    if (JSON.stringify(dayIndexes) !== JSON.stringify(expected)) {
      throw new Error(`RESET-7 doit produire les dayIndex 1 a 7, recu ${dayIndexes.join(", ")}.`);
    }
  }
}

async function buildProgramBundles(mapProgramJsonToPrismaSeedInput) {
  const [indexJson, compareJson] = await Promise.all([readJson("index.json"), readJson("compare.json")]);
  const bundles = [];

  for (const programFile of PROGRAM_FILES) {
    const programJson = await readJson(programFile.file);
    const indexMeta = getIndexMeta(indexJson, programFile.slug);
    const compareMeta = getCompareMeta(compareJson, programFile.slug);
    const mapped = mapProgramJsonToPrismaSeedInput(programJson, {
      slug: programFile.slug,
      title: indexMeta?.title ?? programJson.product,
      tagline: indexMeta?.tagline,
      status: indexMeta?.status ?? "draft",
      level: indexMeta?.level,
      durationDays: indexMeta?.duration_days ?? programJson.days?.length,
      estMinutesPerDay: parseDailyMinutes(compareMeta?.charge) ?? undefined,
      coverUrl: indexMeta?.cover,
      price: normalizeIndexPrice(indexMeta?.price),
      cardHighlights: indexMeta?.card_highlights,
      detail: indexMeta?.detail,
      compare: compareMeta,
    });
    const warnings = buildWarnings({
      slug: programFile.slug,
      programJson,
      mapped,
    });

    assertProgramInvariants(programFile.slug, mapped);

    bundles.push({
      slug: programFile.slug,
      mapped,
      warnings,
    });
  }

  return bundles;
}

function seedId(prefix, ...parts) {
  return `seed_${prefix}_${parts.join("_").replace(/[^a-zA-Z0-9_]/g, "_")}`;
}

function jsonParam(value) {
  return value === null || value === undefined ? null : JSON.stringify(value);
}

async function assertDatabaseReady(sql) {
  await sql`SELECT 1`;

  for (const tableName of ["Program", "Unit"]) {
    const rows = await sql.query(`SELECT to_regclass('public."${tableName}"')::text AS relation`, []);
    if (!rows?.[0]?.relation) {
      throw new Error(`Table public.${tableName} absente.`);
    }
  }
}

async function fetchSeedState(sql, slugs) {
  const programs = await sql.query('SELECT "slug" FROM public."Program" WHERE "slug" = ANY($1::text[])', [slugs]);
  const units = await sql.query(
    'SELECT "programSlug", "unitType", "unitIndex" FROM public."Unit" WHERE "programSlug" = ANY($1::text[]) ORDER BY "programSlug", "unitIndex"',
    [slugs],
  );
  const counts = await sql.query(
    'SELECT (SELECT count(*)::int FROM public."Program") AS "programCount", (SELECT count(*)::int FROM public."Unit") AS "unitCount"',
    [],
  );
  const reset7 = await sql.query(
    'SELECT count(*)::int AS count FROM public."Unit" WHERE "programSlug" = $1 AND "unitType" = $2',
    ["reset-7", "DAY"],
  );
  const boussole = await sql.query('SELECT count(*)::int AS count FROM public."Program" WHERE "slug" = $1', ["boussole-10"]);
  const reset7LegacyMarkers = await sql.query(
    'SELECT count(*)::int AS count FROM public."Unit" WHERE "programSlug" = $1 AND ("content"::text ~ $2 OR "journalSchema"::text ~ $2 OR "validationSchema"::text ~ $2)',
    ["reset-7", "\\m(MOR|MID|EVE)\\M"],
  );

  return {
    programSlugs: programs.map((row) => row.slug).sort(),
    unitKeys: units.map((row) => `${row.programSlug}:${row.unitType}:${row.unitIndex}`),
    programCount: Number(counts?.[0]?.programCount ?? 0),
    unitCount: Number(counts?.[0]?.unitCount ?? 0),
    reset7UnitCount: Number(reset7?.[0]?.count ?? 0),
    boussolePresent: Number(boussole?.[0]?.count ?? 0) > 0,
    reset7LegacyMarkerCount: Number(reset7LegacyMarkers?.[0]?.count ?? 0),
  };
}

async function upsertProgram(sql, program) {
  const data = normalizeProgramData(program);

  await sql.query(
    `
    INSERT INTO public."Program" (
      "id", "slug", "title", "subtitle", "description", "coverUrl", "level", "status",
      "durationDays", "estMinutesPerDay", "unitsCount", "category", "tags", "language",
      "hero", "card", "meta", "marketing", "highlights", "curriculum", "faq", "seo", "price", "metadata",
      "createdAt", "updatedAt"
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7::"ProgramLevel", $8::"ProgramStatus",
      $9, $10, $11, $12, $13::text[], $14,
      $15::jsonb, $16::jsonb, $17::jsonb, $18::jsonb, $19::jsonb, $20::jsonb, $21::jsonb, $22::jsonb, $23::jsonb, $24::jsonb,
      NOW(), NOW()
    )
    ON CONFLICT ("slug") DO UPDATE SET
      "title" = EXCLUDED."title",
      "subtitle" = EXCLUDED."subtitle",
      "description" = EXCLUDED."description",
      "coverUrl" = EXCLUDED."coverUrl",
      "level" = EXCLUDED."level",
      "status" = EXCLUDED."status",
      "durationDays" = EXCLUDED."durationDays",
      "estMinutesPerDay" = EXCLUDED."estMinutesPerDay",
      "unitsCount" = EXCLUDED."unitsCount",
      "category" = EXCLUDED."category",
      "tags" = EXCLUDED."tags",
      "language" = EXCLUDED."language",
      "hero" = EXCLUDED."hero",
      "card" = EXCLUDED."card",
      "meta" = EXCLUDED."meta",
      "marketing" = EXCLUDED."marketing",
      "highlights" = EXCLUDED."highlights",
      "curriculum" = EXCLUDED."curriculum",
      "faq" = EXCLUDED."faq",
      "seo" = EXCLUDED."seo",
      "price" = EXCLUDED."price",
      "metadata" = EXCLUDED."metadata",
      "updatedAt" = NOW()
    `,
    [
      seedId("program", data.slug),
      data.slug,
      data.title,
      data.subtitle,
      data.description,
      data.coverUrl,
      data.level,
      data.status,
      data.durationDays,
      data.estMinutesPerDay,
      data.unitsCount,
      data.category,
      data.tags,
      data.language,
      jsonParam(data.hero),
      jsonParam(data.card),
      jsonParam(data.meta),
      jsonParam(data.marketing),
      jsonParam(data.highlights),
      jsonParam(data.curriculum),
      jsonParam(data.faq),
      jsonParam(data.seo),
      jsonParam(data.price),
      jsonParam(data.metadata),
    ],
  );
}

async function upsertUnit(sql, unit) {
  const data = normalizeUnitData(unit);

  await sql.query(
    `
    INSERT INTO public."Unit" (
      "id", "programSlug", "unitType", "unitIndex", "title", "durationMin", "mantra", "videoUrl",
      "contentParagraphs", "content", "journalSchema", "validationSchema", "status", "createdAt", "updatedAt"
    )
    VALUES (
      $1, $2, $3::"UnitType", $4, $5, $6, $7, $8,
      $9::text[], $10::jsonb, $11::jsonb, $12::jsonb, $13::"UnitStatus", NOW(), NOW()
    )
    ON CONFLICT ("programSlug", "unitType", "unitIndex") DO UPDATE SET
      "title" = EXCLUDED."title",
      "durationMin" = EXCLUDED."durationMin",
      "mantra" = EXCLUDED."mantra",
      "videoUrl" = EXCLUDED."videoUrl",
      "contentParagraphs" = EXCLUDED."contentParagraphs",
      "content" = EXCLUDED."content",
      "journalSchema" = EXCLUDED."journalSchema",
      "validationSchema" = EXCLUDED."validationSchema",
      "status" = EXCLUDED."status",
      "updatedAt" = NOW()
    `,
    [
      seedId("unit", data.programSlug, data.unitType, data.unitIndex),
      data.programSlug,
      data.unitType,
      data.unitIndex,
      data.title,
      data.durationMin,
      data.mantra,
      data.videoUrl,
      data.contentParagraphs,
      jsonParam(data.content),
      jsonParam(data.journalSchema),
      jsonParam(data.validationSchema),
      data.status,
    ],
  );
}

async function upsertProgramBundle(sql, bundle) {
  await upsertProgram(sql, bundle.mapped.program);

  for (const unit of bundle.mapped.units) {
    await upsertUnit(sql, unit);
  }
}

function formatWarnings(warnings) {
  if (!warnings.length) return "- Aucun warning.";
  return warnings.map((warning) => `- ${warning}`).join("\n");
}

function buildReport({ mode, envInfo, bundles, beforeState, afterState, written, startedAt, completedAt }) {
  const totalUnits = bundles.reduce((sum, bundle) => sum + bundle.mapped.units.length, 0);

  return `# Rapport seed programmes Prisma

Genere le ${completedAt}.

## 1. Verdict

${written ? "Seed programmes execute sur la branche Neon cible." : "Dry-run programmes execute sans ecriture DB."}

## 2. Cible

- Branche confirmee : ${TARGET_BRANCH_NAME}
- Branch ID : ${TARGET_BRANCH_ID}
- Endpoint : ${TARGET_ENDPOINT}
- Database : ${envInfo.maskedDatabaseUrl}
- Env files charges : ${envInfo.loadedEnvFiles.join(", ") || "aucun"}
- Mode : ${mode}
- Debut : ${startedAt}
- Fin : ${completedAt}

## 3. Garde-fous

- ALLOW_PRISMA_SEED=true : ${process.env.ALLOW_PRISMA_SEED === "true" ? "OK" : mode === "dry-run" ? "non requis en dry-run" : "KO"}
- CONFIRM_NEON_MAIN_BRANCH=${TARGET_BRANCH_NAME} : OK
- NODE_ENV production : ${process.env.NODE_ENV === "production" ? "KO" : "OK"}
- DATABASE_URL endpoint test : OK
- DIRECT_URL endpoint test direct : OK
- Table Program : OK
- Table Unit : OK

## 4. Donnees source

- Programmes source : ${bundles.map((bundle) => bundle.slug).join(", ")}
- Programmes prevus : ${bundles.length}
- Unites prevues : ${totalUnits}
- RESET-7 : ${bundles.find((bundle) => bundle.slug === "reset-7")?.mapped.units.length ?? 0} unites

## 5. Resultat DB

| Mesure | Avant | Apres |
|---|---:|---:|
| Program count | ${beforeState.programCount} | ${afterState.programCount} |
| Unit count | ${beforeState.unitCount} | ${afterState.unitCount} |
| RESET-7 units | ${beforeState.reset7UnitCount} | ${afterState.reset7UnitCount} |

- Boussole-10 present apres seed : ${afterState.boussolePresent ? "oui" : "non"}
- Marqueurs techniques MOR/MID/EVE dans RESET-7 : ${afterState.reset7LegacyMarkerCount}

## 6. Details programmes

${bundles
  .map(
    (bundle) => `### ${bundle.slug}

- Statut : ${bundle.mapped.program.status}
- Unites : ${bundle.mapped.units.length}
- Action estimee : ${beforeState.programSlugs.includes(bundle.slug) ? "update" : "create"}

Warnings :

${formatWarnings(bundle.warnings)}
`,
  )
  .join("\n")}

## 7. Limites

- Aucune donnee utilisateur n'est seedee.
- Aucune donnee achat, progression, journal, newsletter ou webhook n'est seedee.
- Neon / Prisma est la source canonique cible pour les programmes.
- Aucune bascule publique n'est faite.
- Les lectures programmes actives utilisent Prisma/Neon.
`;
}

async function main() {
  const mode = getMode();
  const envInfo = assertSeedAllowed({ mode });
  if (!envInfo) return;

  const restoreRuntimeHooks = registerRuntimeHooks();
  const startedAt = new Date().toISOString();

  try {
    const { mapProgramJsonToPrismaSeedInput } = require(path.join(rootDir, "src/server/programmes/prisma-programmes.mapper.ts"));
    const sql = neon(envInfo.databaseUrl);
    await assertDatabaseReady(sql);

    const bundles = await buildProgramBundles(mapProgramJsonToPrismaSeedInput);
    const slugs = bundles.map((bundle) => bundle.slug);
    const beforeState = await fetchSeedState(sql, slugs);

    console.log(`[seed-programmes] Mode: ${mode}`);
    console.log(`[seed-programmes] Cible: ${envInfo.maskedDatabaseUrl}`);
    console.log(`[seed-programmes] Programmes: ${slugs.join(", ")}`);

    for (const bundle of bundles) {
      console.log(`[seed-programmes] ${bundle.slug}: ${bundle.mapped.units.length} unites.`);

      for (const warning of bundle.warnings) {
        console.warn(`[seed-programmes][warning] ${bundle.slug}: ${warning}`);
      }
    }

    let written = false;

    if (mode === "write") {
      for (const bundle of bundles) {
        await upsertProgramBundle(sql, bundle);
      }

      written = true;
      console.log("[seed-programmes] Upsert termine.");
    } else {
      console.log("[seed-programmes] Dry-run: aucune ecriture DB.");
    }

    const afterState = await fetchSeedState(sql, slugs);

    if (written) {
      if (afterState.programCount < bundles.length) {
        throw new Error(`Program count insuffisant apres seed: ${afterState.programCount}.`);
      }

      if (afterState.unitCount < bundles.reduce((sum, bundle) => sum + bundle.mapped.units.length, 0)) {
        throw new Error(`Unit count insuffisant apres seed: ${afterState.unitCount}.`);
      }

      if (afterState.reset7UnitCount !== 7) {
        throw new Error(`RESET-7 doit contenir 7 unites apres seed, recu ${afterState.reset7UnitCount}.`);
      }

      if (!afterState.boussolePresent) {
        throw new Error("boussole-10 absent apres seed.");
      }

      if (afterState.reset7LegacyMarkerCount !== 0) {
        throw new Error("Marqueurs MOR/MID/EVE detectes dans RESET-7 apres seed.");
      }
    }

    const completedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    await writeFile(
      reportPath,
      buildReport({
        mode,
        envInfo,
        bundles,
        beforeState,
        afterState,
        written,
        startedAt,
        completedAt,
      }),
      "utf8",
    );

    console.log(`[seed-programmes] Rapport ecrit: ${path.relative(rootDir, reportPath)}`);
    console.log(`[seed-programmes] Program count: ${afterState.programCount}`);
    console.log(`[seed-programmes] Unit count: ${afterState.unitCount}`);
    console.log(`[seed-programmes] RESET-7 units: ${afterState.reset7UnitCount}`);
  } finally {
    restoreRuntimeHooks();
  }
}

main().catch((error) => {
  console.error("[seed-programmes] Seed echoue.");
  console.error(error?.message ?? error);
  process.exitCode = 1;
});
