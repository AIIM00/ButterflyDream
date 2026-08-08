-- CreateEnum
CREATE TYPE "InStoreSaleStatus" AS ENUM ('COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "InStorePaymentMethod" AS ENUM ('CASH', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('IN_STORE_SALE', 'IN_STORE_SALE_CANCELLED', 'IN_STORE_REFUND', 'RESTOCK', 'MANUAL_ADJUSTMENT', 'DAMAGED', 'RETURN');

-- CreateTable
CREATE TABLE "InStoreSale" (
    "id" UUID NOT NULL,
    "saleNumber" VARCHAR(30) NOT NULL,
    "recordedByUserId" UUID,
    "status" "InStoreSaleStatus" NOT NULL DEFAULT 'COMPLETED',
    "paymentMethod" "InStorePaymentMethod" NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "customerName" VARCHAR(120),
    "customerPhone" VARCHAR(30),
    "note" TEXT,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InStoreSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InStoreSaleItem" (
    "id" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "productId" UUID,
    "variantId" UUID,
    "productName" VARCHAR(180) NOT NULL,
    "variantName" VARCHAR(180) NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "options" JSONB NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InStoreSaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" UUID NOT NULL,
    "inventoryId" UUID NOT NULL,
    "inStoreSaleId" UUID,
    "createdByUserId" UUID,
    "type" "InventoryMovementType" NOT NULL,
    "quantityChange" INTEGER NOT NULL,
    "stockBefore" INTEGER NOT NULL,
    "stockAfter" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InStoreSale_saleNumber_key" ON "InStoreSale"("saleNumber");

-- CreateIndex
CREATE INDEX "InStoreSale_status_soldAt_idx" ON "InStoreSale"("status", "soldAt");

-- CreateIndex
CREATE INDEX "InStoreSale_paymentMethod_soldAt_idx" ON "InStoreSale"("paymentMethod", "soldAt");

-- CreateIndex
CREATE INDEX "InStoreSale_recordedByUserId_idx" ON "InStoreSale"("recordedByUserId");

-- CreateIndex
CREATE INDEX "InStoreSale_soldAt_idx" ON "InStoreSale"("soldAt");

-- CreateIndex
CREATE INDEX "InStoreSaleItem_saleId_idx" ON "InStoreSaleItem"("saleId");

-- CreateIndex
CREATE INDEX "InStoreSaleItem_productId_idx" ON "InStoreSaleItem"("productId");

-- CreateIndex
CREATE INDEX "InStoreSaleItem_variantId_idx" ON "InStoreSaleItem"("variantId");

-- CreateIndex
CREATE INDEX "InventoryMovement_inventoryId_createdAt_idx" ON "InventoryMovement"("inventoryId", "createdAt");

-- CreateIndex
CREATE INDEX "InventoryMovement_inStoreSaleId_idx" ON "InventoryMovement"("inStoreSaleId");

-- CreateIndex
CREATE INDEX "InventoryMovement_createdByUserId_idx" ON "InventoryMovement"("createdByUserId");

-- CreateIndex
CREATE INDEX "InventoryMovement_type_createdAt_idx" ON "InventoryMovement"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "InStoreSale" ADD CONSTRAINT "InStoreSale_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InStoreSaleItem" ADD CONSTRAINT "InStoreSaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "InStoreSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InStoreSaleItem" ADD CONSTRAINT "InStoreSaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InStoreSaleItem" ADD CONSTRAINT "InStoreSaleItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_inStoreSaleId_fkey" FOREIGN KEY ("inStoreSaleId") REFERENCES "InStoreSale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
