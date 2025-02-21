/*
  Warnings:

  - Added the required column `inventory_address_id` to the `Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InventoryType" AS ENUM ('NORMAL', 'DEFECTIVE');

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "inventory_address_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "InventoryAddress" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "note" TEXT,
    "type" "InventoryType" NOT NULL,

    CONSTRAINT "InventoryAddress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_inventory_address_id_fkey" FOREIGN KEY ("inventory_address_id") REFERENCES "InventoryAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
