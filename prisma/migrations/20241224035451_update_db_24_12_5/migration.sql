/*
  Warnings:

  - You are about to drop the column `unaccent(title || ' ' || author || ' ' || description)` on the `Books` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Books" DROP COLUMN "unaccent(title || ' ' || author || ' ' || description)",
ADD COLUMN     "unaccent" TEXT;
