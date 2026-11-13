/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const bcrypt = require("bcryptjs");
const { neon } = require("@neondatabase/serverless");

const rootDir = path.resolve(__dirname, "../..");

const TARGET_BRANCH_NAME = "main";
const TARGET_ENDPOINT = "ep-polished-silence-as3p7306";

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

function validateBootstrapInputs() {
  const loadedEnvFiles = loadEnvironment();
  const databaseUrl = parseDatabaseUrl(process.env.DATABASE_URL);
  const directUrl = parseDatabaseUrl(process.env.DIRECT_URL);
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = String(process.env.ADMIN_PASSWORD || "");
  const errors = [];

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRISMA_ADMIN_BOOTSTRAP_PRODUCTION !== "true") {
    errors.push("NODE_ENV=production est interdit sans ALLOW_PRISMA_ADMIN_BOOTSTRAP_PRODUCTION=true.");
  }

  if (process.env.ALLOW_PRISMA_ADMIN_BOOTSTRAP !== "true") {
    errors.push("ALLOW_PRISMA_ADMIN_BOOTSTRAP=true est requis.");
  }

  if (process.env.CONFIRM_NEON_MAIN_BRANCH !== TARGET_BRANCH_NAME) {
    errors.push(`CONFIRM_NEON_MAIN_BRANCH=${TARGET_BRANCH_NAME} est requis.`);
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

  if (!email || !email.includes("@")) {
    errors.push("ADMIN_EMAIL est requis.");
  }

  if (password.length < 12) {
    errors.push("ADMIN_PASSWORD est requis et doit contenir au moins 12 caracteres.");
  }

  if (errors.length) {
    console.error("[bootstrap-admin] Bootstrap admin Prisma refuse.");
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
    email,
    password,
  };
}

async function assertDatabaseReady(sql) {
  await sql`SELECT 1`;

  const rows = await sql.query('SELECT to_regclass(\'public."User"\')::text AS relation', []);
  if (!rows?.[0]?.relation) {
    throw new Error('Table public."User" absente.');
  }
}

async function upsertAdmin(sql, input) {
  const existing = await sql.query('SELECT "id" FROM public."User" WHERE "email" = $1 LIMIT 1', [input.email]);
  const id = existing?.[0]?.id ?? crypto.randomUUID();
  const passwordHash = await bcrypt.hash(input.password, 12);

  const rows = await sql.query(
    `
    INSERT INTO public."User" (
      "id", "email", "name", "role", "passwordHash", "createdAt", "updatedAt"
    )
    VALUES (
      $1, $2, $3, 'ADMIN'::"UserRole", $4, NOW(), NOW()
    )
    ON CONFLICT ("email") DO UPDATE SET
      "role" = 'ADMIN'::"UserRole",
      "passwordHash" = EXCLUDED."passwordHash",
      "deletedAt" = NULL,
      "suspendedAt" = NULL,
      "updatedAt" = NOW()
    RETURNING "id", "email", "role"
    `,
    [id, input.email, input.name, passwordHash],
  );

  return {
    action: existing?.[0]?.id ? "updated" : "created",
    user: rows?.[0] ?? null,
  };
}

async function main() {
  const inputs = validateBootstrapInputs();
  if (!inputs) return;

  const sql = neon(inputs.databaseUrl);
  await assertDatabaseReady(sql);

  const result = await upsertAdmin(sql, {
    email: inputs.email,
    name: process.env.ADMIN_NAME || null,
    password: inputs.password,
  });

  console.log("[bootstrap-admin] Bootstrap admin Prisma OK.");
  console.log(`Env files: ${inputs.loadedEnvFiles.join(", ") || "aucun"}`);
  console.log(`Database: ${inputs.maskedDatabaseUrl}`);
  console.log(`Action: ${result.action}`);
  console.log(`Email: ${result.user?.email ?? inputs.email}`);
  console.log(`Role: ${result.user?.role ?? "ADMIN"}`);
}

main().catch((error) => {
  console.error("[bootstrap-admin] Bootstrap admin Prisma echoue.");
  console.error(error?.message ?? error);
  process.exitCode = 1;
});
