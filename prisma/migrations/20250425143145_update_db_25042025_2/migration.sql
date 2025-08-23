/*
  Warnings:

  - You are about to drop the column `min_quantity` on the `PromotionNormalDetail` table. All the data in the column will be lost.
  - Added the required column `promotion_combo_type` to the `PromotionCombo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discount_value` to the `PromotionComboCondition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `PromotionComboCondition` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PromotionComboType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'SPECIAL_DISCOUNT');

-- DropIndex
DROP INDEX "PromotionComboCondition_promotion_combo_id_key";

-- AlterTable
ALTER TABLE "PromotionCombo" ADD COLUMN     "promotion_combo_type" "PromotionComboType" NOT NULL;

-- AlterTable
ALTER TABLE "PromotionComboCondition" ADD COLUMN     "discount_value" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PromotionNormalDetail" DROP COLUMN "min_quantity",
ALTER COLUMN "discount_rate" SET DATA TYPE DECIMAL(65,30);

-- CreateTable
CREATE TABLE "PromotionComboProduct" (
    "id" TEXT NOT NULL,
    "promotion_combo_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,

    CONSTRAINT "PromotionComboProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PromotionComboProduct" ADD CONSTRAINT "PromotionComboProduct_promotion_combo_id_fkey" FOREIGN KEY ("promotion_combo_id") REFERENCES "PromotionCombo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionComboProduct" ADD CONSTRAINT "PromotionComboProduct_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
