-- DropForeignKey
ALTER TABLE "Chats" DROP CONSTRAINT "Chats_latest_message_id_fkey";

-- AlterTable
ALTER TABLE "Chats" ALTER COLUMN "latest_message_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_latest_message_id_fkey" FOREIGN KEY ("latest_message_id") REFERENCES "Messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
