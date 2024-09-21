-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "userName" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vertifications" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "verified_code" DECIMAL(65,30) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Vertifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResets" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "reset_code" DECIMAL(65,30) NOT NULL,
    "expire_at" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PasswordResets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_userName_key" ON "Users"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_phone_key" ON "Users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Vertifications_user_id_key" ON "Vertifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResets_user_id_key" ON "PasswordResets"("user_id");

-- AddForeignKey
ALTER TABLE "Vertifications" ADD CONSTRAINT "Vertifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResets" ADD CONSTRAINT "PasswordResets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
