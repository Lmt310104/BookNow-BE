/*
  Warnings:

  - Added the required column `expected_date` to the `InventoryForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventoryForm" ADD COLUMN     "expected_date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "state" SET DEFAULT 'PENDING';
