-- CreateIndex
CREATE INDEX "address_fulltext_idx" ON "Address"("full_name", "address", "phone_number");

-- CreateIndex
CREATE INDEX "authors_fulltext_idx" ON "Authors"("name", "description");

-- CreateIndex
CREATE INDEX "books_fulltext_idx" ON "Books"("title", "description", "author");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "orders_fulltext_idx" ON "Orders"("full_name", "phone_number", "address");

-- CreateIndex
CREATE INDEX "reviews_fulltext_idx" ON "Reviews"("title", "description");
