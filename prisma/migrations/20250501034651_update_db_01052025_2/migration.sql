/*
  Warnings:

  - A unique constraint covering the columns `[group_id,user_id,book_id]` on the table `GroupItems` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GroupItems_group_id_user_id_book_id_key" ON "GroupItems"("group_id", "user_id", "book_id");
