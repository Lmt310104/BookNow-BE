/*
  Warnings:

  - You are about to drop the column `book_id` on the `InventoryFormItem` table. All the data in the column will be lost.
  - You are about to drop the `Inventory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_book_id_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_inventory_address_id_fkey";

-- DropForeignKey
ALTER TABLE "InventoryFormItem" DROP CONSTRAINT "InventoryFormItem_book_id_fkey";

-- AlterTable
ALTER TABLE "InventoryFormItem" DROP COLUMN "book_id";

-- DropTable
DROP TABLE "Inventory";
