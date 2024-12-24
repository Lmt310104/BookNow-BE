-- DropIndex
DROP INDEX "books_fulltext_idx";

-- CreateIndex
CREATE INDEX "books_fulltext_idx" ON "Books"("title", "author");
