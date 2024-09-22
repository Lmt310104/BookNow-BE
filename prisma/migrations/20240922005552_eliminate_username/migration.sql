/*
  Warnings:

  - You are about to drop the column `userName` on the `Users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Users_userName_key";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "userName";
