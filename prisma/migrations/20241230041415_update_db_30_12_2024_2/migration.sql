/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `Books` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Books" ADD COLUMN     "sku" TEXT,
ADD COLUMN     "supplier_id" TEXT;

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "Supplier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_phone_key" ON "Supplier"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_email_key" ON "Supplier"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Books_sku_key" ON "Books"("sku");

-- AddForeignKey
ALTER TABLE "Books" ADD CONSTRAINT "Books_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
