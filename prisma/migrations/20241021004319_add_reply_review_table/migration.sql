/*
  Warnings:

  - Added the required column `reply_review_id` to the `Reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reviews" ADD COLUMN     "reply_review_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ReplyReviews" (
    "id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "reply" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReplyReviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReplyReviews_review_id_key" ON "ReplyReviews"("review_id");

-- AddForeignKey
ALTER TABLE "ReplyReviews" ADD CONSTRAINT "ReplyReviews_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
