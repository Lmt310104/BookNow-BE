-- DropIndex
DROP INDEX "Users_phone_key";

-- DropIndex
DROP INDEX "users_fulltext_idx";

-- CreateIndex
CREATE INDEX "Supplier_name_email_phone_idx" ON "Supplier"("name", "email", "phone");

-- CreateIndex
CREATE INDEX "users_fulltext_idx" ON "Users"("full_name", "email", "phone", "type_email");
