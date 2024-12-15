-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'MOMO', 'ZALO', 'VNPAY');

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'COD';
