/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const { neon } = require("@neondatabase/serverless");

const rootDir = path.resolve(__dirname, "../..");
const DEFAULT_USER_EMAIL = "test-user@ancre-toi.local";
const DEFAULT_ADMIN_EMAIL = "test-admin@ancre-toi.local";
const PROGRAM_SLUG = "reset-7";

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

function normalizeEmail(value) {
  return String(value || "").toLowerCase().trim();
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

function resolveStatus(check) {
  if (check.ok) return "OK";
  if (check.severity === "skip") return "SKIP";
  if (check.severity === "warning") return "WARN";
  return "KO";
}

function isBlockingFailure(check) {
  return !check.ok && check.severity !== "warning" && check.severity !== "skip";
}

function getNextStepEquivalent(enrollment, hasDayOneState, totalDays) {
  if (!enrollment) return { type: "none", href: "/programmes" };
  if (enrollment.status === "COMPLETED") return { type: "summary", href: "/espace/bilan" };

  const currentDay = Math.max(1, Math.min(totalDays, Number(enrollment.currentDay ?? 1)));
  if (currentDay === 1 && !hasDayOneState) {
    return { type: "intro", href: `/espace/formations/${PROGRAM_SLUG}` };
  }

  return {
    type: "day",
    href: `/espace/formations/${PROGRAM_SLUG}/jour/${String(currentDay).padStart(2, "0")}`,
  };
}

async function fetchTestUser(sql, email) {
  const result = await rows(
    sql,
    `
    SELECT "id", "email", "role", "passwordHash", "deletedAt", "suspendedAt", "metadata"
    FROM public."User"
    WHERE "email" = $1
    LIMIT 1
    `,
    [email],
  );

  return result?.[0] ?? null;
}

async function fetchEnrollment(sql, userId) {
  if (!userId) return null;

  const result = await rows(
    sql,
    `
    SELECT "id", "status", "currentDay", "introEngaged", "startedAt", "completedAt"
    FROM public."Enrollment"
    WHERE "userId" = $1 AND "programSlug" = $2
    LIMIT 1
    `,
    [userId, PROGRAM_SLUG],
  );

  return result?.[0] ?? null;
}

async function main() {
  const envFiles = loadEnvironment();
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing.");

  const sql = neon(process.env.DATABASE_URL);
  const checks = [];
  const requireTestData = process.env.REQUIRE_AUTH_SMOKE_TEST_DATA === "true";
  const testUserEmail = normalizeEmail(process.env.TEST_USER_EMAIL || DEFAULT_USER_EMAIL);
  const testAdminEmail = normalizeEmail(process.env.TEST_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL);

  await sql`SELECT 1`;
  addCheck(checks, "health: SELECT 1", true, "Neon reachable");

  const program = (
    await rows(
      sql,
      'SELECT "slug", "title", "status" FROM public."Program" WHERE "slug" = $1 AND "deletedAt" IS NULL LIMIT 1',
      [PROGRAM_SLUG],
    )
  )?.[0];
  addCheck(checks, "programmes: reset-7 exists", Boolean(program), program ? `${program.title} (${program.status})` : "missing");

  const reset7Units = await rows(
    sql,
    'SELECT "unitIndex", "unitType", "status" FROM public."Unit" WHERE "programSlug" = $1 AND "unitType" = $2 AND status = $3 ORDER BY "unitIndex" ASC',
    [PROGRAM_SLUG, "DAY", "PUBLISHED"],
  );
  const reset7Indices = reset7Units.map((unit) => Number(unit.unitIndex));
  const reset7Exact = reset7Indices.length === 7 && reset7Indices.every((value, index) => value === index + 1);
  addCheck(checks, "RESET-7: exact day units", reset7Exact, reset7Indices.join(", ") || "none");

  const legacyMarkers = await scalar(
    sql,
    'SELECT count(*)::int AS value FROM public."Unit" WHERE "programSlug" = $1 AND ("content"::text ~ $2 OR "journalSchema"::text ~ $2 OR "validationSchema"::text ~ $2)',
    [PROGRAM_SLUG, "\\m(MOR|MID|EVE)\\M"],
  );
  addCheck(checks, "RESET-7: no MOR/MID/EVE", legacyMarkers === 0, `${legacyMarkers} marker(s)`);

  const testUser = await fetchTestUser(sql, testUserEmail);
  const testAdmin = await fetchTestUser(sql, testAdminEmail);
  const testDataSeverity = requireTestData ? "error" : "skip";

  addCheck(
    checks,
    "auth: test user present",
    Boolean(testUser),
    testUser ? `${testUser.email} (${testUser.role})` : `missing ${testUserEmail}`,
    testDataSeverity,
  );
  addCheck(
    checks,
    "auth: test admin present",
    Boolean(testAdmin),
    testAdmin ? `${testAdmin.email} (${testAdmin.role})` : `missing ${testAdminEmail}`,
    testDataSeverity,
  );

  if (testUser) {
    addCheck(checks, "auth: test user active", !testUser.deletedAt && !testUser.suspendedAt, "not deleted/suspended");
    addCheck(checks, "auth: test user role", testUser.role === "USER", `role=${testUser.role}`);
    addCheck(checks, "auth: test user password", Boolean(testUser.passwordHash), "passwordHash present");
  }

  if (testAdmin) {
    addCheck(checks, "admin: test admin active", !testAdmin.deletedAt && !testAdmin.suspendedAt, "not deleted/suspended");
    addCheck(checks, "admin: test admin role", testAdmin.role === "ADMIN", `role=${testAdmin.role}`);
    addCheck(checks, "admin: test admin password", Boolean(testAdmin.passwordHash), "passwordHash present");
  }

  const enrollment = await fetchEnrollment(sql, testUser?.id);
  addCheck(
    checks,
    "espace: reset-7 enrollment",
    Boolean(enrollment),
    enrollment ? `${enrollment.status} day=${enrollment.currentDay} intro=${enrollment.introEngaged}` : "missing",
    testDataSeverity,
  );

  if (enrollment) {
    const activeAccess = enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED";
    addCheck(checks, "entitlement: reset-7 access", activeAccess, `status=${enrollment.status}`);

    const dayStates = await rows(
      sql,
      `
      SELECT "dayIndex", "practiced", "completed"
      FROM public."DayState"
      WHERE "enrollmentId" = $1 AND "programSlug" = $2
      ORDER BY "dayIndex" ASC
      `,
      [enrollment.id, PROGRAM_SLUG],
    );
    const dayOneState = dayStates.find((state) => Number(state.dayIndex) === 1);
    addCheck(checks, "journal: day state readable", dayStates.length > 0, `${dayStates.length} state(s)`, testDataSeverity);
    addCheck(
      checks,
      "journal: day 1 practiced",
      Boolean(dayOneState?.practiced),
      dayOneState ? `practiced=${dayOneState.practiced}, completed=${dayOneState.completed}` : "missing",
      testDataSeverity,
    );

    const nextStep = getNextStepEquivalent(enrollment, Boolean(dayOneState), reset7Units.length);
    addCheck(checks, "progression: next step", nextStep.type === "day", `${nextStep.type} ${nextStep.href}`, testDataSeverity);
  }

  const productCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."Product" WHERE active = true');
  const reset7ProductCount = await scalar(sql, 'SELECT count(*)::int AS value FROM public."Product" WHERE "programSlug" = $1 AND active = true', [
    PROGRAM_SLUG,
  ]);
  const testPurchaseCount = await scalar(
    sql,
    'SELECT count(*)::int AS value FROM public."Purchase" WHERE "programSlug" = $1 AND "metadata"->>\'scope\' = $2 AND status = $3',
    [PROGRAM_SLUG, "prisma-authenticated-smoke", "PAID"],
  );
  addCheck(checks, "paiement: products readable", productCount >= 0, `${productCount} active product(s)`, "warning");
  addCheck(checks, "paiement: reset-7 product", reset7ProductCount > 0, `${reset7ProductCount} active product(s)`, "warning");
  addCheck(checks, "paiement: simulated purchase", testPurchaseCount > 0, `${testPurchaseCount} paid test purchase(s)`, "warning");

  const adminProgramRead = await rows(
    sql,
    `
    SELECT p."slug", p."title", count(u."id")::int AS units
    FROM public."Program" p
    LEFT JOIN public."Unit" u ON u."programSlug" = p."slug"
    GROUP BY p."slug", p."title"
    ORDER BY p."slug" ASC
    `,
  );
  addCheck(checks, "admin: programmes read", adminProgramRead.length > 0, `${adminProgramRead.length} programme(s)`);

  console.log("# Prisma authenticated smoke");
  console.log(`Env files: ${envFiles.join(", ") || "aucun"}`);
  console.log(`Database: ${maskDatabaseUrl(process.env.DATABASE_URL)}`);
  console.log(`Require test data: ${requireTestData ? "yes" : "no"}`);
  console.log(`Test user: ${testUserEmail}`);
  console.log(`Test admin: ${testAdminEmail}`);

  let hasError = false;
  for (const check of checks) {
    const status = resolveStatus(check);
    console.log(`- ${status} ${check.name}: ${check.details}`);
    if (isBlockingFailure(check)) hasError = true;
  }

  if (hasError) process.exit(1);
}

main().catch((error) => {
  console.error("# Prisma authenticated smoke");
  console.error(`Error: ${error?.code ?? error?.name ?? "UNKNOWN"}`);
  console.error(error?.message ?? "No message");
  process.exit(1);
});
