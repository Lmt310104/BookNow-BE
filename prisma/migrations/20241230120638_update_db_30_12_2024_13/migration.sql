/*
  Warnings:

  - Added the required column `book_id` to the `InventoryFormItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventoryFormItem" ADD COLUMN     "book_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "InventoryFormItem" ADD CONSTRAINT "InventoryFormItem_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
