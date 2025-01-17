-- DropForeignKey
ALTER TABLE "Books" DROP CONSTRAINT "Books_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Books" DROP CONSTRAINT "Books_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_book_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_order_id_fkey";

-- DropForeignKey
ALTER TABLE "Vertifications" DROP CONSTRAINT "Vertifications_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Vertifications" ADD CONSTRAINT "Vertifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Books" ADD CONSTRAINT "Books_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Books" ADD CONSTRAINT "Books_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
