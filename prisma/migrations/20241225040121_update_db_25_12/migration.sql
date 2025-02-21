-- CreateIndex
CREATE INDEX "users_fulltext_idx" ON "Users"("full_name", "email", "phone");
