/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const { neon } = require("@neondatabase/serverless");

const rootDir = path.resolve(__dirname, "../..");

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

function maskDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) return "absent";

  try {
    const url = new URL(value);
    return `${url.protocol.replace(":", "")}://${url.hostname}${url.pathname}`;
  } catch {
    return "present, non parse";
  }
}

async function scalar(sql, query, params = []) {
  const rows = await sql.query(query, params);
  return Number(rows?.[0]?.value ?? 0);
}

async function main() {
  const envFiles = loadEnvironment();
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing.");

  const sql = neon(process.env.DATABASE_URL);
  const result = {
    envFiles,
    databaseUrl: maskDatabaseUrl(),
    selectOne: false,
    programCount: 0,
    publishedProgramCount: 0,
    unitCount: 0,
    userCount: 0,
    enrollmentCount: 0,
    purchaseCount: 0,
    dayStateCount: 0,
    reset7DayUnits: 0,
    reset7LegacyMarkers: 0,
    publishedSlugs: [],
    ok: true,
  };

  await sql`SELECT 1`;
  result.selectOne = true;

  result.programCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."Program"');
  result.publishedProgramCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."Program" WHERE status = $1', ["PUBLISHED"]);
  result.unitCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."Unit"');
  result.userCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."User"');
  result.enrollmentCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."Enrollment"');
  result.purchaseCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."Purchase"');
  result.dayStateCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."DayState"');
  result.reset7DayUnits = await scalar(
    sql,
    'SELECT count(*)::int AS value FROM public."Unit" WHERE "programSlug" = $1 AND "unitType" = $2',
    ["reset-7", "DAY"],
  );
  result.reset7LegacyMarkers = await scalar(
    sql,
    'SELECT count(*)::int AS value FROM public."Unit" WHERE "programSlug" = $1 AND ("content"::text ~ $2 OR "journalSchema"::text ~ $2 OR "validationSchema"::text ~ $2)',
    ["reset-7", "\\m(MOR|MID|EVE)\\M"],
  );

  const slugRows = await sql.query(
    'SELECT slug FROM public."Program" WHERE status = $1 ORDER BY "durationDays" ASC, "createdAt" ASC, slug ASC',
    ["PUBLISHED"],
  );
  result.publishedSlugs = slugRows.map((row) => row.slug);

  if (result.programCount < 1) result.ok = false;
  if (result.unitCount < 1) result.ok = false;
  if (result.reset7DayUnits !== 7) result.ok = false;
  if (result.reset7LegacyMarkers !== 0) result.ok = false;

  console.log("# Prisma data layer");
  console.log(`Env files: ${result.envFiles.join(", ") || "aucun"}`);
  console.log(`Database: ${result.databaseUrl}`);
  console.log(`SELECT 1: ${result.selectOne ? "OK" : "KO"}`);
  console.log(`Programs: ${result.programCount} (${result.publishedProgramCount} published)`);
  console.log(`Units: ${result.unitCount}`);
  console.log(`Users: ${result.userCount}`);
  console.log(`Enrollments: ${result.enrollmentCount}`);
  console.log(`Purchases: ${result.purchaseCount}`);
  console.log(`Day states: ${result.dayStateCount}`);
  console.log(`Published slugs: ${result.publishedSlugs.join(", ") || "aucun"}`);
  console.log(`RESET-7 DAY units: ${result.reset7DayUnits}`);
  console.log(`RESET-7 MOR/MID/EVE markers: ${result.reset7LegacyMarkers}`);

  if (!result.ok) process.exit(1);
}

main().catch((error) => {
  console.error("# Prisma data layer");
  console.error(`Error: ${error?.code ?? error?.name ?? "UNKNOWN"}`);
  console.error(error?.message ?? "No message");
  process.exit(1);
});
