/*
  Warnings:

  - Added the required column `ward_name` to the `NewAddress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NewAddress" ADD COLUMN     "ward_name" TEXT NOT NULL;
