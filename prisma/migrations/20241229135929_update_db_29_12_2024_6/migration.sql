-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "payment_url" TEXT;
