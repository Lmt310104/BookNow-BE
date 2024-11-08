/*
  Warnings:

  - A unique constraint covering the columns `[order_item_id]` on the table `Reviews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_item_id` to the `Reviews` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_reviewsId_fkey";

-- AlterTable
ALTER TABLE "Reviews" ADD COLUMN     "order_item_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_order_item_id_key" ON "Reviews"("order_item_id");

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "OrderItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
