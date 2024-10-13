/*
  Warnings:

  - Added the required column `address` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Books" ADD COLUMN     "avg_stars" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "discountDate" TIMESTAMP(3),
ADD COLUMN     "discountPercentage" INTEGER,
ADD COLUMN     "final_price" DECIMAL(65,30),
ADD COLUMN     "sold_quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_reviews" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "address" TEXT NOT NULL;
