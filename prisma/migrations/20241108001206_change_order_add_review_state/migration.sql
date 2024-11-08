/*
  Warnings:

  - A unique constraint covering the columns `[order_id]` on the table `Reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "review_id" INTEGER,
ADD COLUMN     "review_state" "ReviewState" NOT NULL DEFAULT 'UNANSWERED';

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_order_id_key" ON "Reviews"("order_id");
