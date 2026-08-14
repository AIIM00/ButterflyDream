-- CreateEnum
CREATE TYPE "HomeSectionType" AS ENUM ('ANNOUNCEMENT_BAR', 'OPENING_SLIDER', 'TRANSFORMATION_STORY', 'CATEGORIES', 'FEATURED_PRODUCTS', 'COLLECTIONS', 'FEEDBACK', 'IMAGE_TEXT', 'IMAGE_BANNER');

-- CreateTable
CREATE TABLE "HomeSection" (
    "id" UUID NOT NULL,
    "type" "HomeSectionType" NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" UUID NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" VARCHAR(100) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "altText" VARCHAR(300),
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteTheme" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "colors" JSONB NOT NULL,
    "fonts" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteTheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomeSection_isEnabled_position_idx" ON "HomeSection"("isEnabled", "position");

-- CreateIndex
CREATE INDEX "HomeSection_type_idx" ON "HomeSection"("type");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");
