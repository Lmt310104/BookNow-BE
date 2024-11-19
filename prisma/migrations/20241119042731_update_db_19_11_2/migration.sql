/*
  Warnings:

  - You are about to drop the column `admin_id` on the `Chats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attachments" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Chats" DROP COLUMN "admin_id";

-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
