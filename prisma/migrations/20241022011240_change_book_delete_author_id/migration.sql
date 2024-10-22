/*
  Warnings:

  - You are about to drop the column `author_id` on the `Books` table. All the data in the column will be lost.
  - Added the required column `author` to the `Books` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Books" DROP CONSTRAINT "Books_author_id_fkey";

-- AlterTable
ALTER TABLE "Books" DROP COLUMN "author_id",
ADD COLUMN     "author" TEXT NOT NULL;
