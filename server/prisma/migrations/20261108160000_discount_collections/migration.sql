CREATE TABLE "DiscountCollection" (
  "id" UUID PRIMARY KEY,
  "name" VARCHAR(80) NOT NULL
);
CREATE TABLE "_CollectionProducts" (
  "A" UUID NOT NULL REFERENCES "DiscountCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "B" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "_CollectionProducts_AB_pkey" PRIMARY KEY ("A", "B")
);
CREATE INDEX "_CollectionProducts_B_index" ON "_CollectionProducts"("B");
ALTER TABLE "DiscountCampaign" ADD COLUMN "collectionId" UUID
  REFERENCES "DiscountCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "DiscountCampaign_collectionId_idx" ON "DiscountCampaign"("collectionId");
