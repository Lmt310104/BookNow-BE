/*
  Warnings:

  - You are about to drop the column `anonymous_id` on the `Users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Users_anonymous_id_key";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "anonymous_id",
ALTER COLUMN "birthday" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "avatar_url" DROP NOT NULL;
