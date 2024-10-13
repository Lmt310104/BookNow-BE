/*
  Warnings:

  - Added the required column `title` to the `Reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reviews" ADD COLUMN     "title" TEXT NOT NULL;
