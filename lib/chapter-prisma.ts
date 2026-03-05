import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForChapterPrisma = globalThis as unknown as {
  chapterPrisma?: PrismaClient | undefined
}

function createChapterPrismaClient(): PrismaClient {
  const databaseUrl = process.env.CHAPTER_DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error("CHAPTER_DATABASE_URL is not set in environment variables")
  }

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

export const chapterPrisma: PrismaClient = 
  globalForChapterPrisma.chapterPrisma ?? createChapterPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForChapterPrisma.chapterPrisma = chapterPrisma
}
