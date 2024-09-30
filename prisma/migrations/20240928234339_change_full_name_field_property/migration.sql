/*
  Warnings:

  - You are about to drop the column `fullName` on the `Users` table. All the data in the column will be lost.
  - Added the required column `full_name` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "fullName",
ADD COLUMN     "full_name" TEXT NOT NULL;
