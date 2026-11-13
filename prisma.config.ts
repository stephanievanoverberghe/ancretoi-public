import "dotenv/config";

import { defineConfig } from "prisma/config";

const cliDatabaseUrl =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  // Allows generate/validate before Neon secrets exist. Real migrations require DIRECT_URL.
  "postgresql://user:password@localhost:5432/ancretoi?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: cliDatabaseUrl,
  },
});
