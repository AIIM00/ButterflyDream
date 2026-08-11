ALTER TABLE "Category"
ADD COLUMN "imageStorageKey" TEXT,
ADD COLUMN "imageContentType" VARCHAR(100),
ADD COLUMN "imageFileSize" INTEGER;

CREATE UNIQUE INDEX "Category_imageStorageKey_key"
ON "Category"("imageStorageKey");