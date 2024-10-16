/*
  Warnings:

  - A unique constraint covering the columns `[name,birthday,description]` on the table `Authors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Authors_name_birthday_description_key" ON "Authors"("name", "birthday", "description");
