-- CreateTable
CREATE TABLE "DeliveryGovernorate" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryGovernorate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryGovernorate_name_key" ON "DeliveryGovernorate"("name");

-- CreateIndex
CREATE INDEX "DeliveryGovernorate_isActive_idx" ON "DeliveryGovernorate"("isActive");
