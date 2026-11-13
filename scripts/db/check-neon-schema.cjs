/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const { neon } = require("@neondatabase/serverless");

const rootDir = path.resolve(__dirname, "../..");

const EXPECTED_TABLES = [
  "User",
  "Program",
  "Unit",
  "Enrollment",
  "DayState",
  "BaselineScore",
  "Category",
  "BlogPost",
  "Inspiration",
  "PasswordReset",
  "NewsletterSubscriber",
  "Resource",
  "Product",
  "Purchase",
  "VideoAsset",
  "ConsentLog",
  "WebhookEvent",
];

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

function assertSafeSqlIdentifier(value) {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Unsafe SQL identifier: ${value}`);
  }
}

async function main() {
  const loadedEnvFiles = loadEnvironment();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing.");
  }

  const sql = neon(process.env.DATABASE_URL);
  const result = {
    envFiles: loadedEnvFiles,
    databaseUrl: maskDatabaseUrl(),
    selectOne: false,
    tables: [],
    programCount: null,
    unitCount: null,
    reset7UnitCount: null,
    reset7LegacyMarkerCount: null,
    ok: true,
  };

  await sql`SELECT 1`;
  result.selectOne = true;

  for (const tableName of EXPECTED_TABLES) {
    assertSafeSqlIdentifier(tableName);
    const rows = await sql.query(
      `SELECT to_regclass('public."${tableName}"')::text AS relation`,
      [],
    );
    const exists = Boolean(rows?.[0]?.relation);
    result.tables.push({ name: tableName, exists });
    if (!exists) result.ok = false;
  }

  try {
    const rows = await sql.query('SELECT count(*)::int AS count FROM public."Program"', []);
    result.programCount = Number(rows?.[0]?.count ?? 0);
  } catch (error) {
    result.ok = false;
    result.programCount = `error:${error?.code ?? error?.name ?? "UNKNOWN"}`;
  }

  try {
    const rows = await sql.query('SELECT count(*)::int AS count FROM public."Unit"', []);
    result.unitCount = Number(rows?.[0]?.count ?? 0);
  } catch (error) {
    result.ok = false;
    result.unitCount = `error:${error?.code ?? error?.name ?? "UNKNOWN"}`;
  }

  try {
    const rows = await sql.query(
      'SELECT count(*)::int AS count FROM public."Unit" WHERE "programSlug" = $1 AND "unitType" = $2',
      ["reset-7", "DAY"],
    );
    result.reset7UnitCount = Number(rows?.[0]?.count ?? 0);
  } catch (error) {
    result.ok = false;
    result.reset7UnitCount = `error:${error?.code ?? error?.name ?? "UNKNOWN"}`;
  }

  try {
    const rows = await sql.query(
      'SELECT count(*)::int AS count FROM public."Unit" WHERE "programSlug" = $1 AND ("content"::text ~ $2 OR "journalSchema"::text ~ $2 OR "validationSchema"::text ~ $2)',
      ["reset-7", "\\m(MOR|MID|EVE)\\M"],
    );
    result.reset7LegacyMarkerCount = Number(rows?.[0]?.count ?? 0);
  } catch (error) {
    result.ok = false;
    result.reset7LegacyMarkerCount = `error:${error?.code ?? error?.name ?? "UNKNOWN"}`;
  }

  console.log("# Diagnostic schema Neon");
  console.log(`Env files: ${result.envFiles.join(", ") || "aucun"}`);
  console.log(`Database: ${result.databaseUrl}`);
  console.log(`SELECT 1: ${result.selectOne ? "OK" : "KO"}`);
  console.log(`Program count: ${result.programCount}`);
  console.log(`Unit count: ${result.unitCount}`);
  console.log(`RESET-7 units: ${result.reset7UnitCount}`);
  console.log(`RESET-7 MOR/MID/EVE markers: ${result.reset7LegacyMarkerCount}`);
  console.log("");
  console.log("Tables:");

  for (const table of result.tables) {
    console.log(`- ${table.name}: ${table.exists ? "OK" : "MISSING"}`);
  }

  if (!result.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("# Diagnostic schema Neon");
  console.error(`Error: ${error?.code ?? error?.name ?? "UNKNOWN"}`);
  console.error(error?.message ?? "No message");
  process.exit(1);
});
