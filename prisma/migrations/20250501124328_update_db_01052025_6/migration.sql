/*
  Warnings:

  - You are about to drop the column `postal_code` on the `NewAddress` table. All the data in the column will be lost.
  - Added the required column `city_postal_code` to the `NewAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district_postal_code` to the `NewAddress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NewAddress" DROP COLUMN "postal_code",
ADD COLUMN     "city_postal_code" TEXT NOT NULL,
ADD COLUMN     "district_postal_code" TEXT NOT NULL;
