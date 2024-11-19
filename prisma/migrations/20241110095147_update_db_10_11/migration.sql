/*
  Warnings:

  - Added the required column `full_name` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT NOT NULL;
