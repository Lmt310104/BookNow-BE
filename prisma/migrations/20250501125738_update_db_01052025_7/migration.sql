/*
  Warnings:

  - You are about to drop the column `city` on the `NewAddress` table. All the data in the column will be lost.
  - You are about to drop the column `city_postal_code` on the `NewAddress` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `NewAddress` table. All the data in the column will be lost.
  - You are about to drop the column `district_postal_code` on the `NewAddress` table. All the data in the column will be lost.
  - Added the required column `ward_id` to the `NewAddress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NewAddress" DROP COLUMN "city",
DROP COLUMN "city_postal_code",
DROP COLUMN "district",
DROP COLUMN "district_postal_code",
ADD COLUMN     "ward_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Wards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "district_id" TEXT NOT NULL,

    CONSTRAINT "Wards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Districts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "district_code" TEXT NOT NULL,

    CONSTRAINT "Districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,

    CONSTRAINT "Cities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NewAddress" ADD CONSTRAINT "NewAddress_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "Wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wards" ADD CONSTRAINT "Wards_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "Districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Districts" ADD CONSTRAINT "Districts_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "Cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
