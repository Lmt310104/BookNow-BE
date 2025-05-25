-- AlterTable
ALTER TABLE "GroupMembers" ADD COLUMN     "is_confirmed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Vouchers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vouchers_code_key" ON "Vouchers"("code");
