-- AlterEnum
ALTER TYPE "PromotionCategory" ADD VALUE 'GROUP_DISCOUNT';

-- CreateTable
CREATE TABLE "PromotionGroupBuy" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT NOT NULL,
    "required_user_quantity" INTEGER NOT NULL,
    "discount_amount" DECIMAL(65,30) NOT NULL,
    "discount_rate" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PromotionGroupBuy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromotionGroupBuy_promotion_id_key" ON "PromotionGroupBuy"("promotion_id");

-- AddForeignKey
ALTER TABLE "PromotionGroupBuy" ADD CONSTRAINT "PromotionGroupBuy_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
