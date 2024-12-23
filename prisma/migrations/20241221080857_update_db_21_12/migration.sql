/*
  Warnings:

  - Added the required column `pending_at` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "pending_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "processing_at" TIMESTAMP(3),
ADD COLUMN     "reject_at" TIMESTAMP(3),
ADD COLUMN     "success_at" TIMESTAMP(3);
