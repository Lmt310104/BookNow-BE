/*
  Warnings:

  - You are about to drop the column `authorId` on the `Books` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Books` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Books` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Users` table. All the data in the column will be lost.
  - Added the required column `author_id` to the `Books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `Books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Books" DROP CONSTRAINT "Books_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Books" DROP CONSTRAINT "Books_categoryId_fkey";

-- AlterTable
ALTER TABLE "Books" DROP COLUMN "authorId",
DROP COLUMN "categoryId",
DROP COLUMN "updatedAt",
ADD COLUMN     "author_id" TEXT NOT NULL,
ADD COLUMN     "category_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Books" ADD CONSTRAINT "Books_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Books" ADD CONSTRAINT "Books_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
