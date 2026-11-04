-- CreateEnum
CREATE TYPE "DiscountKind" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "DiscountMode" AS ENUM ('AUTOMATIC', 'CODE', 'VIP');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discountSnapshot" JSONB;

-- CreateTable
CREATE TABLE "DiscountCampaign" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "mode" "DiscountMode" NOT NULL,
    "kind" "DiscountKind" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "code" VARCHAR(64),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "maxRedemptions" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountRedemption" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "userId" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "restoredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IncludedProducts" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_IncludedProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ExcludedProducts" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ExcludedProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_VIPCustomers" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_VIPCustomers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCampaign_code_key" ON "DiscountCampaign"("code");

-- CreateIndex
CREATE INDEX "DiscountCampaign_active_mode_startsAt_endsAt_idx" ON "DiscountCampaign"("active", "mode", "startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountRedemption_orderId_key" ON "DiscountRedemption"("orderId");

-- CreateIndex
CREATE INDEX "DiscountRedemption_campaignId_restoredAt_idx" ON "DiscountRedemption"("campaignId", "restoredAt");

-- CreateIndex
CREATE INDEX "DiscountRedemption_userId_createdAt_idx" ON "DiscountRedemption"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "_IncludedProducts_B_index" ON "_IncludedProducts"("B");

-- CreateIndex
CREATE INDEX "_ExcludedProducts_B_index" ON "_ExcludedProducts"("B");

-- CreateIndex
CREATE INDEX "_VIPCustomers_B_index" ON "_VIPCustomers"("B");

-- AddForeignKey
ALTER TABLE "DiscountRedemption" ADD CONSTRAINT "DiscountRedemption_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "DiscountCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountRedemption" ADD CONSTRAINT "DiscountRedemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountRedemption" ADD CONSTRAINT "DiscountRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncludedProducts" ADD CONSTRAINT "_IncludedProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "DiscountCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncludedProducts" ADD CONSTRAINT "_IncludedProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExcludedProducts" ADD CONSTRAINT "_ExcludedProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "DiscountCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExcludedProducts" ADD CONSTRAINT "_ExcludedProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VIPCustomers" ADD CONSTRAINT "_VIPCustomers_A_fkey" FOREIGN KEY ("A") REFERENCES "DiscountCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VIPCustomers" ADD CONSTRAINT "_VIPCustomers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Guard monetary and campaign invariants even for writes outside the API.
ALTER TABLE "DiscountCampaign"
  ADD CONSTRAINT "discount_value_positive" CHECK ("value" > 0 AND ("kind" <> 'PERCENTAGE' OR "value" <= 100)),
  ADD CONSTRAINT "discount_usage_valid" CHECK ("usedCount" >= 0 AND ("maxRedemptions" IS NULL OR ("maxRedemptions" > 0 AND "usedCount" <= "maxRedemptions"))),
  ADD CONSTRAINT "discount_dates_valid" CHECK ("startsAt" IS NULL OR "endsAt" IS NULL OR "endsAt" > "startsAt"),
  ADD CONSTRAINT "discount_code_valid" CHECK (("mode" = 'AUTOMATIC' AND "code" IS NULL) OR ("mode" <> 'AUTOMATIC' AND "code" ~ '^[A-Z0-9_-]{1,64}$'));
ALTER TABLE "DiscountRedemption" ADD CONSTRAINT "discount_redemption_amount_positive" CHECK ("amount" > 0);
