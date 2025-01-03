/*
  Warnings:

  - You are about to drop the column `is_disable` on the `Reviews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reviews" DROP COLUMN "is_disable",
ADD COLUMN     "is_hidden" BOOLEAN NOT NULL DEFAULT false;
