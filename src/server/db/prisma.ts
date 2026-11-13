import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaClient?: PrismaClient;
};

let prismaClient: PrismaClient | undefined;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma.");
  }

  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({ adapter });
}

/**
 * Retourne le client Prisma applicatif.
 * En developpement, le client est memorise sur `globalThis` pour eviter les reconnexions HMR.
 */
export function getPrismaClient() {
  const cachedClient =
    process.env.NODE_ENV === "production"
      ? prismaClient
      : globalForPrisma.prismaClient;

  if (cachedClient) {
    return cachedClient;
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV === "production") {
    prismaClient = client;
  } else {
    globalForPrisma.prismaClient = client;
  }

  return client;
}

/**
 * Indique si l'environnement peut initialiser Prisma sans declencher de connexion.
 */
export function isPrismaConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Verifie la connexion Neon/Prisma avec une requete non destructive.
 */
export async function checkPrismaConnection() {
  if (!isPrismaConfigured()) {
    return {
      ok: false,
      error: "DATABASE_URL is not configured.",
    } as const;
  }

  try {
    await getPrismaClient().$queryRaw`SELECT 1`;

    return { ok: true } as const;
  } catch {
    return {
      ok: false,
      error: "Prisma connection check failed.",
    } as const;
  }
}
