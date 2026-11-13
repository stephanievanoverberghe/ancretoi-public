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

async function rows(sql, query, params = []) {
  return sql.query(query, params);
}

function addCheck(checks, name, ok, details, severity = "error") {
  checks.push({ name, ok: Boolean(ok), details, severity });
}

async function main() {
  const envFiles = loadEnvironment();
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing.");

  const sql = neon(process.env.DATABASE_URL);
  const checks = [];

  await sql`SELECT 1`;
  addCheck(checks, "health: SELECT 1", true, "Neon reachable");

  const userCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."User" WHERE "deletedAt" IS NULL');
  const passwordUserCount = await scalar(
    sql,
    'SELECT count(*)::int AS value FROM public."User" WHERE "deletedAt" IS NULL AND "passwordHash" IS NOT NULL AND length("passwordHash") > 0',
  );
  const adminCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."User" WHERE "deletedAt" IS NULL AND role = $1', ["ADMIN"]);

  addCheck(checks, "auth: active users", userCount > 0, `${userCount} active user(s)`);
  addCheck(checks, "auth: password users", passwordUserCount > 0, `${passwordUserCount} password-enabled user(s)`);
  addCheck(checks, "admin: admin access", adminCount > 0, `${adminCount} admin user(s)`);

  const publishedPrograms = await rows(
    sql,
    'SELECT slug, title, "durationDays" FROM public."Program" WHERE status = $1 AND "deletedAt" IS NULL ORDER BY "durationDays" ASC, "createdAt" ASC, slug ASC',
    ["PUBLISHED"],
  );
  const publishedSlugs = publishedPrograms.map((program) => program.slug);
  const reset7 = publishedPrograms.find((program) => program.slug === "reset-7");
  const boussole10 = publishedPrograms.find((program) => program.slug === "boussole-10");

  addCheck(checks, "programmes: published slugs", publishedPrograms.length >= 2, publishedSlugs.join(", ") || "none");
  addCheck(checks, "programmes: reset-7 published", Boolean(reset7), reset7 ? reset7.title : "missing");
  addCheck(checks, "programmes: boussole-10 published", Boolean(boussole10), boussole10 ? boussole10.title : "missing");

  const reset7Units = await rows(
    sql,
    'SELECT "unitIndex", title FROM public."Unit" WHERE "programSlug" = $1 AND "unitType" = $2 AND status = $3 ORDER BY "unitIndex" ASC',
    ["reset-7", "DAY", "PUBLISHED"],
  );
  const reset7Indices = reset7Units.map((unit) => Number(unit.unitIndex));
  const reset7Expected = [1, 2, 3, 4, 5, 6, 7];
  const reset7Exact =
    reset7Indices.length === reset7Expected.length && reset7Expected.every((expected, index) => reset7Indices[index] === expected);
  const legacyMarkers = await scalar(
    sql,
    'SELECT count(*)::int AS value FROM public."Unit" WHERE "programSlug" = $1 AND ("content"::text ~ $2 OR "journalSchema"::text ~ $2 OR "validationSchema"::text ~ $2)',
    ["reset-7", "\\m(MOR|MID|EVE)\\M"],
  );

  addCheck(checks, "RESET-7: exact day units", reset7Exact, reset7Indices.join(", ") || "none");
  addCheck(checks, "RESET-7: no MOR/MID/EVE", legacyMarkers === 0, `${legacyMarkers} marker(s)`);

  const activeProducts = await scalar(sql, 'SELECT count(*)::int AS value FROM public."Product" WHERE active = true');
  const purchaseCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."Purchase"');
  addCheck(checks, "paiement: products readable", activeProducts >= 0, `${activeProducts} active product(s)`, "warning");
  addCheck(checks, "paiement: purchases readable", purchaseCount >= 0, `${purchaseCount} purchase(s)`, "warning");

  const enrollmentCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."Enrollment"');
  const dayStateCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."DayState"');
  const completedDayStateCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."DayState" WHERE completed = true');
  addCheck(checks, "espace: enrollments readable", enrollmentCount >= 0, `${enrollmentCount} enrollment(s)`, "warning");
  addCheck(checks, "journal: day states readable", dayStateCount >= 0, `${dayStateCount} day state(s), ${completedDayStateCount} completed`, "warning");

  const adminCounts = await rows(
    sql,
    `SELECT
      (SELECT count(*)::int FROM public."Category") AS categories,
      (SELECT count(*)::int FROM public."BlogPost" WHERE "deletedAt" IS NULL) AS blog_posts,
      (SELECT count(*)::int FROM public."Inspiration" WHERE "deletedAt" IS NULL) AS inspirations,
      (SELECT count(*)::int FROM public."NewsletterSubscriber") AS newsletter_subscribers,
      (SELECT count(*)::int FROM public."Resource") AS resources`,
  );
  const adminRow = adminCounts[0] ?? {};
  addCheck(
    checks,
    "admin: read models",
    true,
    `categories=${adminRow.categories ?? 0}, articles=${adminRow.blog_posts ?? 0}, inspirations=${adminRow.inspirations ?? 0}, newsletter=${adminRow.newsletter_subscribers ?? 0}, resources=${adminRow.resources ?? 0}`,
  );

  console.log("# Prisma functional smoke");
  console.log(`Env files: ${envFiles.join(", ") || "aucun"}`);
  console.log(`Database: ${maskDatabaseUrl()}`);

  let hasError = false;
  for (const check of checks) {
    const status = check.ok ? "OK" : check.severity === "warning" ? "WARN" : "KO";
    console.log(`- ${status} ${check.name}: ${check.details}`);
    if (!check.ok && check.severity !== "warning") hasError = true;
  }

  if (hasError) process.exit(1);
}

main().catch((error) => {
  console.error("# Prisma functional smoke");
  console.error(`Error: ${error?.code ?? error?.name ?? "UNKNOWN"}`);
  console.error(error?.message ?? "No message");
  process.exit(1);
});
