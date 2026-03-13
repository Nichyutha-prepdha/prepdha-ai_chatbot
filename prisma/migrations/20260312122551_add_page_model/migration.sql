/*
  Warnings:

  - You are about to drop the column `created_at` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `keyword` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `logo_data_url` on the `School` table. All the data in the column will be lost.
  - You are about to drop the `Board` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Chapter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassSubject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentChunk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentHighlight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Page` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SchoolClassSubject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentGamificationState` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserClassSubject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `XpRule` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `School` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_class_id_fkey";

-- DropForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "ClassSubject" DROP CONSTRAINT "ClassSubject_class_id_fkey";

-- DropForeignKey
ALTER TABLE "ClassSubject" DROP CONSTRAINT "ClassSubject_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_school_id_fkey";

-- DropForeignKey
ALTER TABLE "DocumentChunk" DROP CONSTRAINT "DocumentChunk_document_id_fkey";

-- DropForeignKey
ALTER TABLE "DocumentHighlight" DROP CONSTRAINT "DocumentHighlight_document_id_fkey";

-- DropForeignKey
ALTER TABLE "DocumentHighlight" DROP CONSTRAINT "DocumentHighlight_user_id_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "SchoolClassSubject" DROP CONSTRAINT "SchoolClassSubject_class_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "SchoolClassSubject" DROP CONSTRAINT "SchoolClassSubject_school_id_fkey";

-- DropForeignKey
ALTER TABLE "StudentGamificationState" DROP CONSTRAINT "StudentGamificationState_student_id_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_board_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_school_id_fkey";

-- DropForeignKey
ALTER TABLE "UserClassSubject" DROP CONSTRAINT "UserClassSubject_class_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "UserClassSubject" DROP CONSTRAINT "UserClassSubject_user_id_school_id_fkey";

-- DropIndex
DROP INDEX "School_keyword_key";

-- AlterTable
ALTER TABLE "School" DROP COLUMN "created_at",
DROP COLUMN "is_active",
DROP COLUMN "keyword",
DROP COLUMN "logo_data_url",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Board";

-- DropTable
DROP TABLE "Chapter";

-- DropTable
DROP TABLE "Class";

-- DropTable
DROP TABLE "ClassSubject";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "DocumentChunk";

-- DropTable
DROP TABLE "DocumentHighlight";

-- DropTable
DROP TABLE "Page";

-- DropTable
DROP TABLE "SchoolClassSubject";

-- DropTable
DROP TABLE "StudentGamificationState";

-- DropTable
DROP TABLE "Subject";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserClassSubject";

-- DropTable
DROP TABLE "XpRule";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "summary" TEXT,
    "grade" TEXT,
    "subject" TEXT,
    "chapter" TEXT,
    "schoolId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
