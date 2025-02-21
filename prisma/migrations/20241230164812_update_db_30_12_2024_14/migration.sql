/*
  Warnings:

  - A unique constraint covering the columns `[email,type_email]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Users_email_key";

-- AlterTable
ALTER TABLE "Authors" ADD COLUMN     "unaccent" TEXT;

-- AlterTable
ALTER TABLE "Books" ALTER COLUMN "author" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AdjustStockForm" (
    "id" TEXT NOT NULL,
    "type" "InventoryType" NOT NULL,
    "state" "InventoryFormState" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdjustStockForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdjustStockFormItem" (
    "id" TEXT NOT NULL,
    "adjust_stock_form_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "book_id" TEXT,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "AdjustStockFormItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_type_email_key" ON "Users"("email", "type_email");

-- AddForeignKey
ALTER TABLE "AdjustStockFormItem" ADD CONSTRAINT "AdjustStockFormItem_adjust_stock_form_id_fkey" FOREIGN KEY ("adjust_stock_form_id") REFERENCES "AdjustStockForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjustStockFormItem" ADD CONSTRAINT "AdjustStockFormItem_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE SET NULL ON UPDATE CASCADE;
