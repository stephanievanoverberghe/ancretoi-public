/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const bcrypt = require("bcryptjs");
const { neon } = require("@neondatabase/serverless");

const rootDir = path.resolve(__dirname, "../..");
const TEST_SCOPE = "prisma-authenticated-smoke";
const DEFAULT_USER_EMAIL = "test-user@ancre-toi.local";
const DEFAULT_ADMIN_EMAIL = "test-admin@ancre-toi.local";
const PROGRAM_SLUG = "reset-7";
const TEST_PRODUCT_SLUG = "db5f-reset-7-access";

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

function jsonParam(value) {
  return JSON.stringify(value);
}

function seedId(prefix, ...parts) {
  return `db5f_${prefix}_${parts.join("_").replace(/[^a-zA-Z0-9_]/g, "_")}`;
}

function assertLocalTestEmail(email, label, errors) {
  if (!email || !email.includes("@")) {
    errors.push(`${label} est requis.`);
    return;
  }

  if (!email.endsWith(".local") && process.env.ALLOW_NON_LOCAL_TEST_EMAILS !== "true") {
    errors.push(`${label} doit utiliser un email de test .local ou ALLOW_NON_LOCAL_TEST_EMAILS=true.`);
  }
}

function validateInputs({ writeMode }) {
  const loadedEnvFiles = loadEnvironment();
  const databaseUrl = parseDatabaseUrl(process.env.DATABASE_URL);
  const directUrl = parseDatabaseUrl(process.env.DIRECT_URL);
  const testUserEmail = normalizeEmail(process.env.TEST_USER_EMAIL || DEFAULT_USER_EMAIL);
  const testAdminEmail = normalizeEmail(process.env.TEST_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL);
  const testUserPassword = String(process.env.TEST_USER_PASSWORD || "");
  const testAdminPassword = String(process.env.TEST_ADMIN_PASSWORD || "");
  const confirmedTestBranch = String(process.env.CONFIRM_NEON_TEST_BRANCH || "").trim();
  const confirmedTestEndpoint = String(process.env.CONFIRM_NEON_TEST_ENDPOINT || "").trim();
  const errors = [];

  if (!databaseUrl) {
    errors.push("DATABASE_URL est requis et doit etre parseable.");
  }

  if (databaseUrl && !databaseUrl.hostname.includes("-pooler")) {
    errors.push("DATABASE_URL doit pointer vers l'URL pooled Neon.");
  }

  if (!directUrl) {
    errors.push("DIRECT_URL est requis et doit etre parseable.");
  }

  if (directUrl && directUrl.hostname.includes("-pooler")) {
    errors.push("DIRECT_URL doit pointer vers l'URL directe Neon sans pooler.");
  }

  assertLocalTestEmail(testUserEmail, "TEST_USER_EMAIL", errors);
  assertLocalTestEmail(testAdminEmail, "TEST_ADMIN_EMAIL", errors);

  if (testUserEmail === testAdminEmail) {
    errors.push("TEST_USER_EMAIL et TEST_ADMIN_EMAIL doivent etre differents.");
  }

  if (writeMode) {
    if (process.env.NODE_ENV === "production") {
      errors.push("NODE_ENV=production est interdit pour les donnees de test.");
    }

    if (process.env.ALLOW_TEST_DB_WRITES !== "true") {
      errors.push("ALLOW_TEST_DB_WRITES=true est requis pour ecrire.");
    }

    if (process.env.CONFIRM_TEST_DATA_SCOPE !== TEST_SCOPE) {
      errors.push(`CONFIRM_TEST_DATA_SCOPE=${TEST_SCOPE} est requis.`);
    }

    if (!confirmedTestBranch || confirmedTestBranch === "main") {
      errors.push("CONFIRM_NEON_TEST_BRANCH doit nommer une branche Neon dediee et ne doit pas valoir main.");
    }

    if (confirmedTestEndpoint) {
      if (databaseUrl && !databaseUrl.hostname.includes(confirmedTestEndpoint)) {
        errors.push(`DATABASE_URL ne pointe pas vers l'endpoint confirme ${confirmedTestEndpoint}.`);
      }

      if (directUrl && !directUrl.hostname.includes(confirmedTestEndpoint)) {
        errors.push(`DIRECT_URL ne pointe pas vers l'endpoint confirme ${confirmedTestEndpoint}.`);
      }
    }

    if (testUserPassword.length < 12) {
      errors.push("TEST_USER_PASSWORD est requis et doit contenir au moins 12 caracteres.");
    }

    if (testAdminPassword.length < 12) {
      errors.push("TEST_ADMIN_PASSWORD est requis et doit contenir au moins 12 caracteres.");
    }
  }

  if (errors.length) {
    console.error("[db5f-test-data] Preparation refusee.");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return null;
  }

  return {
    loadedEnvFiles,
    databaseUrl: process.env.DATABASE_URL,
    maskedDatabaseUrl: maskDatabaseUrl(process.env.DATABASE_URL),
    testUserEmail,
    testAdminEmail,
    testUserPassword,
    testAdminPassword,
    confirmedTestBranch,
    confirmedTestEndpoint,
  };
}

async function scalar(sql, query, params = []) {
  const rows = await sql.query(query, params);
  return Number(rows?.[0]?.value ?? 0);
}

async function assertDatabaseReady(sql) {
  await sql`SELECT 1`;

  for (const tableName of ["User", "Program", "Unit", "Enrollment", "DayState", "Product", "Purchase"]) {
    const rows = await sql.query(`SELECT to_regclass('public."${tableName}"')::text AS relation`, []);
    if (!rows?.[0]?.relation) {
      throw new Error(`Table public.${tableName} absente.`);
    }
  }

  const reset7Units = await scalar(
    sql,
    'SELECT count(*)::int AS value FROM public."Unit" WHERE "programSlug" = $1 AND "unitType" = $2 AND status = $3',
    [PROGRAM_SLUG, "DAY", "PUBLISHED"],
  );
  const reset7LegacyMarkers = await scalar(
    sql,
    'SELECT count(*)::int AS value FROM public."Unit" WHERE "programSlug" = $1 AND ("content"::text ~ $2 OR "journalSchema"::text ~ $2 OR "validationSchema"::text ~ $2)',
    [PROGRAM_SLUG, "\\m(MOR|MID|EVE)\\M"],
  );

  if (reset7Units !== 7) {
    throw new Error(`RESET-7 doit contenir 7 unites DAY publiees, recu ${reset7Units}.`);
  }

  if (reset7LegacyMarkers !== 0) {
    throw new Error(`RESET-7 contient ${reset7LegacyMarkers} marqueur(s) MOR/MID/EVE.`);
  }
}

async function inspectState(sql, input) {
  const users = await sql.query(
    `
    SELECT "email", "role", "deletedAt", "suspendedAt"
    FROM public."User"
    WHERE "email" = ANY($1::text[])
    ORDER BY "email" ASC
    `,
    [[input.testUserEmail, input.testAdminEmail]],
  );
  const enrollment = await sql.query(
    `
    SELECT e."id", e."status", e."currentDay", e."introEngaged", count(ds."id")::int AS "dayStates"
    FROM public."Enrollment" e
    LEFT JOIN public."DayState" ds ON ds."enrollmentId" = e."id"
    WHERE e."programSlug" = $1
      AND e."userId" = (SELECT "id" FROM public."User" WHERE "email" = $2)
    GROUP BY e."id"
    `,
    [PROGRAM_SLUG, input.testUserEmail],
  );
  const purchaseCount = await scalar(
    sql,
    'SELECT count(*)::int AS value FROM public."Purchase" WHERE "stripeSessionId" = $1',
    [seedId("stripe_session", PROGRAM_SLUG, input.testUserEmail)],
  );
  const productCount = await scalar(
    sql,
    'SELECT count(*)::int AS value FROM public."Product" WHERE "slug" = $1 AND "programSlug" = $2 AND active = true',
    [TEST_PRODUCT_SLUG, PROGRAM_SLUG],
  );

  return {
    users,
    enrollment: enrollment?.[0] ?? null,
    productCount,
    purchaseCount,
  };
}

async function upsertUser(sql, input) {
  const existing = await sql.query('SELECT "id" FROM public."User" WHERE "email" = $1 LIMIT 1', [input.email]);
  const id = existing?.[0]?.id ?? seedId("user", input.email);
  const passwordHash = await bcrypt.hash(input.password, 12);
  const metadata = {
    testData: true,
    scope: TEST_SCOPE,
    updatedBy: "DB5F",
  };

  const rows = await sql.query(
    `
    INSERT INTO public."User" (
      "id", "email", "name", "role", "passwordHash", "features", "metadata", "createdAt", "updatedAt"
    )
    VALUES (
      $1, $2, $3, $4::"UserRole", $5, ARRAY[$6]::text[], $7::jsonb, NOW(), NOW()
    )
    ON CONFLICT ("email") DO UPDATE SET
      "name" = EXCLUDED."name",
      "role" = EXCLUDED."role",
      "passwordHash" = EXCLUDED."passwordHash",
      "features" = ARRAY(SELECT DISTINCT unnest("User"."features" || EXCLUDED."features")),
      "metadata" = COALESCE("User"."metadata", '{}'::jsonb) || EXCLUDED."metadata",
      "deletedAt" = NULL,
      "suspendedAt" = NULL,
      "updatedAt" = NOW()
    RETURNING "id", "email", "role"
    `,
    [id, input.email, input.name, input.role, passwordHash, TEST_SCOPE, jsonParam(metadata)],
  );

  return {
    action: existing?.[0]?.id ? "updated" : "created",
    user: rows?.[0] ?? null,
  };
}

async function upsertEnrollment(sql, userId) {
  const metadata = {
    testData: true,
    scope: TEST_SCOPE,
    updatedBy: "DB5F",
  };

  const rows = await sql.query(
    `
    INSERT INTO public."Enrollment" (
      "id", "userId", "programSlug", "status", "startedAt", "currentDay", "introEngaged", "metadata", "createdAt", "updatedAt"
    )
    VALUES (
      $1, $2, $3, 'ACTIVE'::"EnrollmentStatus", NOW(), 1, true, $4::jsonb, NOW(), NOW()
    )
    ON CONFLICT ("userId", "programSlug") DO UPDATE SET
      "status" = 'ACTIVE'::"EnrollmentStatus",
      "currentDay" = 1,
      "introEngaged" = true,
      "startedAt" = COALESCE("Enrollment"."startedAt", NOW()),
      "metadata" = COALESCE("Enrollment"."metadata", '{}'::jsonb) || EXCLUDED."metadata",
      "updatedAt" = NOW()
    RETURNING "id", "status", "currentDay", "introEngaged"
    `,
    [seedId("enrollment", userId, PROGRAM_SLUG), userId, PROGRAM_SLUG, jsonParam(metadata)],
  );

  return rows?.[0] ?? null;
}

async function upsertTestProduct(sql) {
  const metadata = {
    testData: true,
    scope: TEST_SCOPE,
    updatedBy: "QA1",
    purpose: "checkout entitlement smoke",
  };

  const rows = await sql.query(
    `
    INSERT INTO public."Product" (
      "id", "slug", "programSlug", "name", "amountCents", "currency", "active", "metadata", "createdAt", "updatedAt"
    )
    VALUES (
      $1, $2, $3, $4, 0, 'EUR', true, $5::jsonb, NOW(), NOW()
    )
    ON CONFLICT ("slug") DO UPDATE SET
      "programSlug" = EXCLUDED."programSlug",
      "name" = EXCLUDED."name",
      "amountCents" = EXCLUDED."amountCents",
      "currency" = EXCLUDED."currency",
      "active" = true,
      "metadata" = COALESCE("Product"."metadata", '{}'::jsonb) || EXCLUDED."metadata",
      "updatedAt" = NOW()
    RETURNING "id", "slug", "programSlug", "active"
    `,
    [seedId("product", PROGRAM_SLUG), TEST_PRODUCT_SLUG, PROGRAM_SLUG, "DB5F RESET-7 test access", jsonParam(metadata)],
  );

  return rows?.[0] ?? null;
}

async function upsertDayState(sql, input) {
  const data = {
    testData: true,
    scope: TEST_SCOPE,
    note: "Smoke test journal J1",
  };
  const answers = {
    intention: "Tester RESET-7 sans donnees sensibles",
  };

  const rows = await sql.query(
    `
    INSERT INTO public."DayState" (
      "id", "enrollmentId", "userId", "programSlug", "dayIndex", "data", "answers", "practiced", "completed", "completedAt", "createdAt", "updatedAt"
    )
    VALUES (
      $1, $2, $3, $4, 1, $5::jsonb, $6::jsonb, true, false, NULL, NOW(), NOW()
    )
    ON CONFLICT ("enrollmentId", "dayIndex") DO UPDATE SET
      "data" = EXCLUDED."data",
      "answers" = EXCLUDED."answers",
      "practiced" = true,
      "completed" = false,
      "completedAt" = NULL,
      "updatedAt" = NOW()
    RETURNING "id", "dayIndex", "practiced", "completed"
    `,
    [
      seedId("day_state", input.enrollmentId, "day_1"),
      input.enrollmentId,
      input.userId,
      PROGRAM_SLUG,
      jsonParam(data),
      jsonParam(answers),
    ],
  );

  return rows?.[0] ?? null;
}

async function upsertOptionalPurchase(sql, input) {
  if (process.env.INCLUDE_TEST_PURCHASE !== "true") return null;

  const stripeSessionId = seedId("stripe_session", PROGRAM_SLUG, input.email);
  const metadata = {
    testData: true,
    scope: TEST_SCOPE,
    simulated: true,
  };
  const rows = await sql.query(
    `
    INSERT INTO public."Purchase" (
      "id", "userId", "productId", "programSlug", "stripeSessionId", "amountCents", "currency", "status", "metadata", "createdAt", "updatedAt"
    )
    VALUES (
      $1, $2, $3, $4, $5, 0, 'EUR', 'PAID'::"PurchaseStatus", $6::jsonb, NOW(), NOW()
    )
    ON CONFLICT ("stripeSessionId") DO UPDATE SET
      "productId" = EXCLUDED."productId",
      "status" = 'PAID'::"PurchaseStatus",
      "metadata" = COALESCE("Purchase"."metadata", '{}'::jsonb) || EXCLUDED."metadata",
      "updatedAt" = NOW()
    RETURNING "id", "status"
    `,
    [
      seedId("purchase", PROGRAM_SLUG, input.userId),
      input.userId,
      input.productId,
      PROGRAM_SLUG,
      stripeSessionId,
      jsonParam(metadata),
    ],
  );

  return rows?.[0] ?? null;
}

async function main() {
  const writeMode = process.env.ALLOW_TEST_DB_WRITES === "true";
  const input = validateInputs({ writeMode });
  if (!input) return;

  const sql = neon(input.databaseUrl);
  await assertDatabaseReady(sql);

  console.log("# DB5F authenticated test data");
  console.log(`Mode: ${writeMode ? "write" : "read-only"}`);
  console.log(`Env files: ${input.loadedEnvFiles.join(", ") || "aucun"}`);
  console.log(`Database: ${input.maskedDatabaseUrl}`);
  console.log(`Test user: ${input.testUserEmail}`);
  console.log(`Test admin: ${input.testAdminEmail}`);
  console.log(`Confirmed test branch: ${input.confirmedTestBranch || "none"}`);
  console.log(`Confirmed test endpoint: ${input.confirmedTestEndpoint || "none"}`);

  if (!writeMode) {
    const state = await inspectState(sql, input);
    console.log(`Existing test users: ${state.users.length}`);
    console.log(`Existing reset-7 enrollment: ${state.enrollment ? "yes" : "no"}`);
    console.log(`Existing reset-7 test product: ${state.productCount}`);
    console.log(`Existing optional test purchase: ${state.purchaseCount}`);
    console.log("No write performed. Set ALLOW_TEST_DB_WRITES=true, CONFIRM_TEST_DATA_SCOPE=prisma-authenticated-smoke and CONFIRM_NEON_TEST_BRANCH to prepare data.");
    return;
  }

  const product = await upsertTestProduct(sql);
  const testUser = await upsertUser(sql, {
    email: input.testUserEmail,
    name: "Test User DB5F",
    role: "USER",
    password: input.testUserPassword,
  });
  const testAdmin = await upsertUser(sql, {
    email: input.testAdminEmail,
    name: "Test Admin DB5F",
    role: "ADMIN",
    password: input.testAdminPassword,
  });
  const enrollment = await upsertEnrollment(sql, testUser.user.id);
  const dayState = await upsertDayState(sql, {
    enrollmentId: enrollment.id,
    userId: testUser.user.id,
  });
  const purchase = await upsertOptionalPurchase(sql, { userId: testUser.user.id, email: input.testUserEmail, productId: product.id });

  console.log(`Product: ${product.slug} active=${product.active}`);
  console.log(`User: ${testUser.action} ${testUser.user.email} (${testUser.user.role})`);
  console.log(`Admin: ${testAdmin.action} ${testAdmin.user.email} (${testAdmin.user.role})`);
  console.log(`Enrollment: ${enrollment.id} ${enrollment.status} day=${enrollment.currentDay} intro=${enrollment.introEngaged}`);
  console.log(`DayState: ${dayState.id} day=${dayState.dayIndex} practiced=${dayState.practiced} completed=${dayState.completed}`);
  console.log(`Purchase: ${purchase ? `${purchase.id} ${purchase.status}` : "not requested"}`);
}

main().catch((error) => {
  console.error("[db5f-test-data] Echec.");
  console.error(error?.message ?? error);
  process.exitCode = 1;
});
