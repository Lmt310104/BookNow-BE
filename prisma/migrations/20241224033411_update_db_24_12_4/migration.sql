-- AlterTable
ALTER TABLE "Books" ALTER COLUMN "unaccent(title || ' ' || author || ' ' || description)" DROP DEFAULT;
