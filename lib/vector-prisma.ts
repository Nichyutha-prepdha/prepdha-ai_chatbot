import { PrismaClient } from "@prisma/client";

const globalForVectorPrisma = globalThis as unknown as {
  vectorPrisma?: PrismaClient | undefined;
};

function createVectorPrismaClient(): PrismaClient {
  const databaseUrl =
    process.env.VECTOR_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.CHAPTER_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "VECTOR_DATABASE_URL, DATABASE_URL, or CHAPTER_DATABASE_URL must be set"
    );
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const vectorPrisma: PrismaClient =
  globalForVectorPrisma.vectorPrisma ?? createVectorPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForVectorPrisma.vectorPrisma = vectorPrisma;
}

