/*
  Warnings:

  - You are about to drop the column `type` on the `Reviews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reviews" DROP COLUMN "type",
ADD COLUMN     "is_disable" BOOLEAN NOT NULL DEFAULT false;
