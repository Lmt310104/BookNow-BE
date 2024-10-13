/*
  Warnings:

  - You are about to drop the column `fullName` on the `Orders` table. All the data in the column will be lost.
  - Added the required column `full_name` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "fullName",
ADD COLUMN     "full_name" TEXT NOT NULL;
