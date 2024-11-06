-- CreateEnum
CREATE TYPE "ReviewState" AS ENUM ('UNANSWERED', 'ANSWERED');

-- AlterTable
ALTER TABLE "Reviews" ADD COLUMN     "state" "ReviewState" NOT NULL DEFAULT 'UNANSWERED';
