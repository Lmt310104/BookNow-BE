/*
  Warnings:

  - You are about to drop the column `group_id` on the `GroupItems` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `GroupItems` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[group_member_id,book_id]` on the table `GroupItems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `group_member_id` to the `GroupItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GroupItems" DROP CONSTRAINT "GroupItems_group_id_fkey";

-- DropForeignKey
ALTER TABLE "GroupItems" DROP CONSTRAINT "GroupItems_user_id_fkey";

-- DropIndex
DROP INDEX "GroupItems_group_id_user_id_book_id_key";

-- AlterTable
ALTER TABLE "GroupItems" DROP COLUMN "group_id",
DROP COLUMN "user_id",
ADD COLUMN     "group_member_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "GroupMembers" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "GroupMembers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupItems_group_member_id_book_id_key" ON "GroupItems"("group_member_id", "book_id");

-- AddForeignKey
ALTER TABLE "GroupMembers" ADD CONSTRAINT "GroupMembers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembers" ADD CONSTRAINT "GroupMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupItems" ADD CONSTRAINT "GroupItems_group_member_id_fkey" FOREIGN KEY ("group_member_id") REFERENCES "GroupMembers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
