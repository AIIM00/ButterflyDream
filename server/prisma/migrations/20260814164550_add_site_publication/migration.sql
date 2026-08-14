-- CreateTable
CREATE TABLE "SitePublication" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "homepage" JSONB NOT NULL,
    "theme" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePublication_pkey" PRIMARY KEY ("id")
);
