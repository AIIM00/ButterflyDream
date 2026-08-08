/*
  Warnings:

  - A unique constraint covering the columns `[storageKey]` on the table `ProductImage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "contentType" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "storageKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_storageKey_key" ON "ProductImage"("storageKey");
