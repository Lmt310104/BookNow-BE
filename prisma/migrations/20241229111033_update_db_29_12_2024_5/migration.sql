-- CreateEnum
CREATE TYPE "TypeEmail" AS ENUM ('NORMAL', 'GOOGLE');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "type_email" "TypeEmail" NOT NULL DEFAULT 'NORMAL';
