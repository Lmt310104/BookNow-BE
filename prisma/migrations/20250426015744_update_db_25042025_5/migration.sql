/*
  Warnings:

  - Added the required column `promotion_shock_deal_type` to the `PromotionShockDeal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PromotionShockDealType" AS ENUM ('BUY_WITH_SHOCK_DEAL', 'BUY_TO_GET_GIFT');

-- DropIndex
DROP INDEX "PromotionShockDealCondition_promotion_shock_deal_id_key";

-- AlterTable
ALTER TABLE "PromotionShockDeal" ADD COLUMN     "gift_quantity" INTEGER,
ADD COLUMN     "promotion_shock_deal_type" "PromotionShockDealType" NOT NULL,
ADD COLUMN     "required_purchase_quantity" INTEGER;

-- CreateTable
CREATE TABLE "PromotionShockDealBook" (
    "id" TEXT NOT NULL,
    "promotion_shock_deal_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,

    CONSTRAINT "PromotionShockDealBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionShockDealFreeGiftBook" (
    "id" TEXT NOT NULL,
    "promotion_shock_deal_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,

    CONSTRAINT "PromotionShockDealFreeGiftBook_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PromotionShockDealBook" ADD CONSTRAINT "PromotionShockDealBook_promotion_shock_deal_id_fkey" FOREIGN KEY ("promotion_shock_deal_id") REFERENCES "PromotionShockDeal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionShockDealBook" ADD CONSTRAINT "PromotionShockDealBook_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionShockDealFreeGiftBook" ADD CONSTRAINT "PromotionShockDealFreeGiftBook_promotion_shock_deal_id_fkey" FOREIGN KEY ("promotion_shock_deal_id") REFERENCES "PromotionShockDeal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionShockDealFreeGiftBook" ADD CONSTRAINT "PromotionShockDealFreeGiftBook_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
