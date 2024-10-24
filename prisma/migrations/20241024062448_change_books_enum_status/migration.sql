/*
  Warnings:

  - The values [INSTOCK,OUTOFSTOCK,LOWSTOCK] on the enum `BookStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookStatus_new" AS ENUM ('INACTIVE', 'ACTIVE');
ALTER TABLE "Books" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Books" ALTER COLUMN "status" TYPE "BookStatus_new" USING ("status"::text::"BookStatus_new");
ALTER TYPE "BookStatus" RENAME TO "BookStatus_old";
ALTER TYPE "BookStatus_new" RENAME TO "BookStatus";
DROP TYPE "BookStatus_old";
ALTER TABLE "Books" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "Books" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
