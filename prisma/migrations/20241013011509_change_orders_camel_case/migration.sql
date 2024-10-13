/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `Orders` table. All the data in the column will be lost.
  - Added the required column `phone_number` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "phoneNumber",
ADD COLUMN     "phone_number" TEXT NOT NULL;
