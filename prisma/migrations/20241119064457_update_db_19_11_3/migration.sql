/*
  Warnings:

  - You are about to drop the column `last_message_id` on the `Chats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[latest_message_id]` on the table `Chats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chat_latest_id]` on the table `Messages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `latest_message_id` to the `Chats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chats" DROP COLUMN "last_message_id",
ADD COLUMN     "latest_message_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "chat_latest_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Chats_latest_message_id_key" ON "Chats"("latest_message_id");

-- CreateIndex
CREATE UNIQUE INDEX "Messages_chat_latest_id_key" ON "Messages"("chat_latest_id");

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_latest_message_id_fkey" FOREIGN KEY ("latest_message_id") REFERENCES "Messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
