-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED', 'SUCCESS', 'REJECT');

-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('INACTIVE', 'ACTIVE');

-- CreateEnum
CREATE TYPE "ReviewState" AS ENUM ('UNREVIEW', 'REVIEWED', 'REPLIED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'MOMO', 'ZALOPAY', 'VNPAY');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('POSITIVE', 'NEGATIVE', 'CONSTRUCTIVE', 'SPAM', 'TOXIC');

-- CreateEnum
CREATE TYPE "TypeEmail" AS ENUM ('NORMAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "TypeUser" AS ENUM ('POTENTIAL_CUSTOMER', 'SYSTEM_CUSTOMER');

-- CreateEnum
CREATE TYPE "InventoryType" AS ENUM ('NORMAL', 'DEFECTIVE');

-- CreateEnum
CREATE TYPE "InventoryFormType" AS ENUM ('PURCHASE', 'RESTOCK');

-- CreateEnum
CREATE TYPE "InventoryFormState" AS ENUM ('PENDING', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PromotionCategory" AS ENUM ('SHOP_DISCOUNT', 'COMBO_DISCOUNT', 'DEAL_DISCOUNT');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED', 'SPECIAL');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(100),
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "birthday" TIMESTAMP(3),
    "gender" "Gender",
    "role" "Role" NOT NULL,
    "avatar_url" TEXT,
    "code_reset_password" VARCHAR(6),
    "refresh_token" VARCHAR(255),
    "is_disable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "unaccent" TEXT,
    "type_email" "TypeEmail" NOT NULL DEFAULT 'NORMAL',
    "type_user" "TypeUser" NOT NULL DEFAULT 'SYSTEM_CUSTOMER',

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vertifications" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "verified_code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Vertifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Books" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "author" TEXT,
    "category_id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "stock_quantity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "entry_price" DECIMAL(65,30) NOT NULL,
    "final_price" DECIMAL(65,30),
    "discountPercentage" INTEGER,
    "discountDate" TIMESTAMP(3),
    "avg_stars" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "sold_quantity" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "BookStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "unaccent" TEXT,
    "supplier_id" TEXT,
    "sku" TEXT,

    CONSTRAINT "Books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_disable" BOOLEAN NOT NULL DEFAULT false,
    "unaccent" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authors" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "unaccent" TEXT,

    CONSTRAINT "Authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookAuthor" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,

    CONSTRAINT "BookAuthor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "review_state" "ReviewState" NOT NULL DEFAULT 'UNREVIEW',
    "total_price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "pending_at" TIMESTAMP(3) NOT NULL,
    "processing_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "success_at" TIMESTAMP(3),
    "reject_at" TIMESTAMP(3),
    "note" TEXT,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "payment_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'COD',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItems" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "review_status" "ReviewState" NOT NULL DEFAULT 'UNREVIEW',
    "review_id" INTEGER,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "total_price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "OrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carts" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItems" (
    "id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "book_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rating" DECIMAL(65,30) NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "state" "ReviewState" NOT NULL DEFAULT 'UNREVIEW',
    "type" "ReviewType" NOT NULL,
    "reply_review_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_item_id" TEXT NOT NULL,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplyReviews" (
    "id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "reply" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReplyReviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "unaccent" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "unaccent" TEXT,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryForm" (
    "id" TEXT NOT NULL,
    "type" "InventoryFormType" NOT NULL,
    "state" "InventoryFormState" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "expected_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryFormItem" (
    "id" TEXT NOT NULL,
    "inventory_form_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "expected_quantity" INTEGER NOT NULL,
    "entry_price" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "selling_price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "InventoryFormItem_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "InventoryAddress" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "note" TEXT,
    "type" "InventoryType" NOT NULL,

    CONSTRAINT "InventoryAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "order_limit" INTEGER,
    "description" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "promotion_category" "PromotionCategory" NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionNormalDetail" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "discount_amount" DECIMAL(65,30) NOT NULL,
    "min_quantity" INTEGER,
    "discount_rate" INTEGER NOT NULL,

    CONSTRAINT "PromotionNormalDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionCombo" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT NOT NULL,

    CONSTRAINT "PromotionCombo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionComboCondition" (
    "id" TEXT NOT NULL,
    "promotion_combo_id" TEXT NOT NULL,

    CONSTRAINT "PromotionComboCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionShockDeal" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT NOT NULL,

    CONSTRAINT "PromotionShockDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionShockDealCondition" (
    "id" TEXT NOT NULL,
    "promotion_shock_deal_id" TEXT NOT NULL,
    "discount_rate" INTEGER NOT NULL,
    "discount_amount" DECIMAL(65,30) NOT NULL,
    "book_id" TEXT NOT NULL,

    CONSTRAINT "PromotionShockDealCondition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_fulltext_idx" ON "Users"("full_name", "email", "phone", "type_email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_type_email_key" ON "Users"("email", "type_email");

-- CreateIndex
CREATE UNIQUE INDEX "Vertifications_user_id_key" ON "Vertifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Books_sku_key" ON "Books"("sku");

-- CreateIndex
CREATE INDEX "books_fulltext_idx" ON "Books"("title", "author");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "authors_fulltext_idx" ON "Authors"("name", "description");

-- CreateIndex
CREATE UNIQUE INDEX "Authors_name_birthday_description_key" ON "Authors"("name", "birthday", "description");

-- CreateIndex
CREATE UNIQUE INDEX "BookAuthor_book_id_author_id_key" ON "BookAuthor"("book_id", "author_id");

-- CreateIndex
CREATE INDEX "orders_fulltext_idx" ON "Orders"("full_name", "phone_number", "address");

-- CreateIndex
CREATE UNIQUE INDEX "Carts_user_id_key" ON "Carts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_order_item_id_key" ON "Reviews"("order_item_id");

-- CreateIndex
CREATE INDEX "reviews_fulltext_idx" ON "Reviews"("title", "description");

-- CreateIndex
CREATE UNIQUE INDEX "ReplyReviews_review_id_key" ON "ReplyReviews"("review_id");

-- CreateIndex
CREATE INDEX "address_fulltext_idx" ON "Address"("full_name", "address", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "Supplier"("name");

-- CreateIndex
CREATE INDEX "Supplier_name_email_phone_idx" ON "Supplier"("name", "email", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionNormalDetail_promotion_id_key" ON "PromotionNormalDetail"("promotion_id");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionNormalDetail_book_id_key" ON "PromotionNormalDetail"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionCombo_promotion_id_key" ON "PromotionCombo"("promotion_id");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionComboCondition_promotion_combo_id_key" ON "PromotionComboCondition"("promotion_combo_id");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionShockDeal_promotion_id_key" ON "PromotionShockDeal"("promotion_id");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionShockDealCondition_promotion_shock_deal_id_key" ON "PromotionShockDealCondition"("promotion_shock_deal_id");

-- AddForeignKey
ALTER TABLE "Vertifications" ADD CONSTRAINT "Vertifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Books" ADD CONSTRAINT "Books_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Books" ADD CONSTRAINT "Books_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAuthor" ADD CONSTRAINT "BookAuthor_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAuthor" ADD CONSTRAINT "BookAuthor_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carts" ADD CONSTRAINT "Carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "OrderItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplyReviews" ADD CONSTRAINT "ReplyReviews_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryFormItem" ADD CONSTRAINT "InventoryFormItem_inventory_form_id_fkey" FOREIGN KEY ("inventory_form_id") REFERENCES "InventoryForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryFormItem" ADD CONSTRAINT "InventoryFormItem_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjustStockFormItem" ADD CONSTRAINT "AdjustStockFormItem_adjust_stock_form_id_fkey" FOREIGN KEY ("adjust_stock_form_id") REFERENCES "AdjustStockForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdjustStockFormItem" ADD CONSTRAINT "AdjustStockFormItem_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionNormalDetail" ADD CONSTRAINT "PromotionNormalDetail_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionNormalDetail" ADD CONSTRAINT "PromotionNormalDetail_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionCombo" ADD CONSTRAINT "PromotionCombo_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionComboCondition" ADD CONSTRAINT "PromotionComboCondition_promotion_combo_id_fkey" FOREIGN KEY ("promotion_combo_id") REFERENCES "PromotionCombo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionShockDeal" ADD CONSTRAINT "PromotionShockDeal_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionShockDealCondition" ADD CONSTRAINT "PromotionShockDealCondition_promotion_shock_deal_id_fkey" FOREIGN KEY ("promotion_shock_deal_id") REFERENCES "PromotionShockDeal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionShockDealCondition" ADD CONSTRAINT "PromotionShockDealCondition_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
