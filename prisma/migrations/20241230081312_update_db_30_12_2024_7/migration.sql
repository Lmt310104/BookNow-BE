/*
  Warnings:

  - You are about to drop the `AnonymousUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TypeUser" AS ENUM ('POTENTIAL_CUSTOMER', 'SYSTEM_CUSTOMER');

-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_anonymous_id_fkey";

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "type_user" "TypeUser" NOT NULL DEFAULT 'SYSTEM_CUSTOMER';

-- DropTable
DROP TABLE "AnonymousUser";
