/*
  Warnings:

  - You are about to drop the column `ward_id` on the `NewAddress` table. All the data in the column will be lost.
  - You are about to drop the `Wards` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `district_id` to the `NewAddress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "NewAddress" DROP CONSTRAINT "NewAddress_ward_id_fkey";

-- DropForeignKey
ALTER TABLE "Wards" DROP CONSTRAINT "Wards_district_id_fkey";

-- AlterTable
ALTER TABLE "NewAddress" DROP COLUMN "ward_id",
ADD COLUMN     "district_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "Wards";

-- AddForeignKey
ALTER TABLE "NewAddress" ADD CONSTRAINT "NewAddress_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "Districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
