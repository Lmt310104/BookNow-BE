-- AlterTable
ALTER TABLE "Books" ADD COLUMN     "unaccent(title || ' ' || author || ' ' || description)" TEXT NOT NULL DEFAULT 'text_search(title || '' '' || author || '' '' || description)';
