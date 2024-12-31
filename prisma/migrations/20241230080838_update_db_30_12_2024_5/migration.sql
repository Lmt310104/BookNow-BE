/*
  Warnings:

  - You are about to drop the column `birthday` on the `AnonymousUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[anonymous_id]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AnonymousUser" DROP COLUMN "birthday";

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "anonymous_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Users_anonymous_id_key" ON "Users"("anonymous_id");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_anonymous_id_fkey" FOREIGN KEY ("anonymous_id") REFERENCES "AnonymousUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
