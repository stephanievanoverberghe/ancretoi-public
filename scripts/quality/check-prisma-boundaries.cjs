/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "../..");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs", ".json", ".md"]);
const DIRECTORIES_TO_SCAN = ["src", "scripts"];
const EXTRA_FILES_TO_SCAN = ["package.json", ".env.example", ".env.local.example"];
const SELF = path.relative(rootDir, __filename).replaceAll("\\", "/");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relative = path.relative(rootDir, fullPath).replaceAll("\\", "/");

    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git", "src/generated/prisma"].includes(relative)) continue;
      walk(fullPath, files);
      continue;
    }

    if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;
    files.push(relative);
  }

  return files;
}

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function isReactComponent(relativePath) {
  return relativePath.endsWith(".tsx") || relativePath.startsWith("src/components/") || relativePath.startsWith("src/features/");
}

function isServerPath(relativePath) {
  return relativePath.startsWith("src/server/");
}

function isGeneratedOrPrismaPath(relativePath) {
  return relativePath.startsWith("src/generated/prisma/") || relativePath.startsWith("prisma/");
}

function collectFiles() {
  const files = [];
  for (const directory of DIRECTORIES_TO_SCAN) walk(path.join(rootDir, directory), files);
  for (const file of EXTRA_FILES_TO_SCAN) if (fs.existsSync(path.join(rootDir, file))) files.push(file);
  return files.filter((file) => file !== SELF);
}

function hasUseClient(content) {
  const firstStatements = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"))
    .slice(0, 5);

  return firstStatements.some((line) => line === '"use client";' || line === "'use client';" || line === '"use client"' || line === "'use client'");
}

function main() {
  const violations = [];
  const files = collectFiles();

  if (fs.existsSync(path.join(rootDir, "src/models"))) {
    violations.push({ file: "src/models", rule: "Aucun dossier src/models manuel avec Prisma." });
  }

  for (const file of files) {
    const content = read(file);
    const normalized = content.replace(/\r\n/g, "\n");

    const mongoPatterns = [
      { pattern: /\bmongoose\b/i, label: "mongoose" },
      { pattern: /\bmongodb\b/i, label: "mongodb" },
      { pattern: /\bMONGODB_URI\b/, label: "MONGODB_URI" },
      { pattern: /from\s+['"]@\/models\//, label: "@/models" },
      { pattern: /from\s+['"]@\/db\//, label: "@/db" },
    ];

    for (const { pattern, label } of mongoPatterns) {
      if (pattern.test(normalized)) {
        violations.push({ file, rule: `Référence Mongo active détectée: ${label}.` });
      }
    }

    const importsPrismaDirectly =
      /from\s+['"]@\/server\/db\/prisma['"]/.test(normalized) ||
      /from\s+['"]@\/generated\/prisma/.test(normalized) ||
      /from\s+['"]@prisma\/client['"]/.test(normalized) ||
      /\bgetPrismaClient\s*\(/.test(normalized);

    if (importsPrismaDirectly && !isServerPath(file) && !isGeneratedOrPrismaPath(file)) {
      violations.push({ file, rule: "Prisma direct hors src/server." });
    }

    if (isReactComponent(file) && importsPrismaDirectly) {
      violations.push({ file, rule: "Composant React avec import/appel Prisma direct." });
    }

    if (hasUseClient(normalized) && /from\s+['"]@\/server\//.test(normalized)) {
      violations.push({ file, rule: 'Fichier "use client" important @/server.' });
    }
  }

  console.log("# Prisma boundaries");
  console.log(`Files scanned: ${files.length}`);
  console.log(`Violations: ${violations.length}`);

  for (const violation of violations) {
    console.log(`- ${violation.file}: ${violation.rule}`);
  }

  if (violations.length > 0) process.exit(1);
}

main();
