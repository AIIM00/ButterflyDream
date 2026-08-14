-- CreateEnum
CREATE TYPE "PopupEventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "PopupEvent" (
    "id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "location" VARCHAR(180),
    "dateLabel" VARCHAR(80),
    "caption" TEXT NOT NULL,
    "status" "PopupEventStatus" NOT NULL DEFAULT 'DRAFT',
    "commentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdByUserId" UUID,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PopupEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopupEventImage" (
    "id" UUID NOT NULL,
    "popupEventId" UUID NOT NULL,
    "mediaAssetId" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "altText" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PopupEventImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopupEventLike" (
    "id" UUID NOT NULL,
    "popupEventId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PopupEventLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopupEventAttendance" (
    "id" UUID NOT NULL,
    "popupEventId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PopupEventAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopupEventComment" (
    "id" UUID NOT NULL,
    "popupEventId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "body" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PopupEventComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PopupEvent_status_position_idx" ON "PopupEvent"("status", "position");

-- CreateIndex
CREATE INDEX "PopupEvent_publishedAt_idx" ON "PopupEvent"("publishedAt");

-- CreateIndex
CREATE INDEX "PopupEvent_createdByUserId_idx" ON "PopupEvent"("createdByUserId");

-- CreateIndex
CREATE INDEX "PopupEventImage_popupEventId_position_idx" ON "PopupEventImage"("popupEventId", "position");

-- CreateIndex
CREATE INDEX "PopupEventImage_mediaAssetId_idx" ON "PopupEventImage"("mediaAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "PopupEventImage_popupEventId_mediaAssetId_key" ON "PopupEventImage"("popupEventId", "mediaAssetId");

-- CreateIndex
CREATE INDEX "PopupEventLike_userId_idx" ON "PopupEventLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PopupEventLike_popupEventId_userId_key" ON "PopupEventLike"("popupEventId", "userId");

-- CreateIndex
CREATE INDEX "PopupEventAttendance_userId_idx" ON "PopupEventAttendance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PopupEventAttendance_popupEventId_userId_key" ON "PopupEventAttendance"("popupEventId", "userId");

-- CreateIndex
CREATE INDEX "PopupEventComment_popupEventId_createdAt_idx" ON "PopupEventComment"("popupEventId", "createdAt");

-- CreateIndex
CREATE INDEX "PopupEventComment_userId_idx" ON "PopupEventComment"("userId");

-- AddForeignKey
ALTER TABLE "PopupEvent" ADD CONSTRAINT "PopupEvent_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopupEventImage" ADD CONSTRAINT "PopupEventImage_popupEventId_fkey" FOREIGN KEY ("popupEventId") REFERENCES "PopupEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopupEventImage" ADD CONSTRAINT "PopupEventImage_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopupEventLike" ADD CONSTRAINT "PopupEventLike_popupEventId_fkey" FOREIGN KEY ("popupEventId") REFERENCES "PopupEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopupEventLike" ADD CONSTRAINT "PopupEventLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopupEventAttendance" ADD CONSTRAINT "PopupEventAttendance_popupEventId_fkey" FOREIGN KEY ("popupEventId") REFERENCES "PopupEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopupEventAttendance" ADD CONSTRAINT "PopupEventAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopupEventComment" ADD CONSTRAINT "PopupEventComment_popupEventId_fkey" FOREIGN KEY ("popupEventId") REFERENCES "PopupEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopupEventComment" ADD CONSTRAINT "PopupEventComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
