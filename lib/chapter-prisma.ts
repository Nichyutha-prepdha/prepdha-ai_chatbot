import { PrismaClient } from "@prisma/client"

const globalForChapterPrisma = globalThis as unknown as {
  chapterPrisma?: PrismaClient | undefined
}

function createChapterPrismaClient(): PrismaClient {
  const databaseUrl = process.env.CHAPTER_DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error("CHAPTER_DATABASE_URL is not set in environment variables")
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

export const chapterPrisma: PrismaClient = 
  globalForChapterPrisma.chapterPrisma ?? createChapterPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForChapterPrisma.chapterPrisma = chapterPrisma
}
