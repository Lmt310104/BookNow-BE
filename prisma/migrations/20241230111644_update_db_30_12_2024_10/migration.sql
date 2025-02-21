-- CreateEnum
CREATE TYPE "InventoryFormType" AS ENUM ('PURCHASE', 'RESTOCK');

-- CreateEnum
CREATE TYPE "InventoryFormState" AS ENUM ('PENDING', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "InventoryForm" (
    "id" TEXT NOT NULL,
    "type" "InventoryFormType" NOT NULL,
    "state" "InventoryFormState" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryFormItem" (
    "id" TEXT NOT NULL,
    "inventory_form_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "expected_quantity" INTEGER NOT NULL,
    "entry_price" DECIMAL(65,30) NOT NULL,
    "book_id" TEXT,
    "quantity" INTEGER NOT NULL,
    "selling_price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "InventoryFormItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InventoryFormItem" ADD CONSTRAINT "InventoryFormItem_inventory_form_id_fkey" FOREIGN KEY ("inventory_form_id") REFERENCES "InventoryForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryFormItem" ADD CONSTRAINT "InventoryFormItem_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE SET NULL ON UPDATE CASCADE;
