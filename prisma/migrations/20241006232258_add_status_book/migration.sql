-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('INSTOCK', 'OUTOFSTOCK', 'LOWSTOCK');

-- AlterTable
ALTER TABLE "Books" ADD COLUMN     "status" "BookStatus" NOT NULL DEFAULT 'INSTOCK';
