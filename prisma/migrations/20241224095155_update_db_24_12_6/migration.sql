/*
  Warnings:

  - The values [ZALO] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('COD', 'MOMO', 'ZALOPAY', 'VNPAY');
ALTER TABLE "Orders" ALTER COLUMN "payment_method" DROP DEFAULT;
ALTER TABLE "Orders" ALTER COLUMN "payment_method" TYPE "PaymentMethod_new" USING ("payment_method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
ALTER TABLE "Orders" ALTER COLUMN "payment_method" SET DEFAULT 'COD';
COMMIT;
