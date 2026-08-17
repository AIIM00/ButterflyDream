import assert from "node:assert/strict";
import test from "node:test";

import {
  canUseGroupedVariantSelector,
  findVariant,
  getConcreteVariantChoices,
  getVariantColorChoices,
  selectInitialVariant,
} from "./variantSelection.js";

function createVariant(overrides = {}) {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    sku: overrides.sku ?? "SKU",
    displayName: overrides.displayName ?? "Option",
    options: overrides.options ?? {},
    inStock: overrides.inStock ?? true,
    stockStatus: overrides.stockStatus ?? "IN_STOCK",
    isDefault: overrides.isDefault ?? false,
  };
}

test("uses grouped controls for a complete, unique option matrix", () => {
  const variants = ["Gold", "Silver"].flatMap((metalColor) =>
    ["6", "7"].map((size) =>
      createVariant({
        options: {
          metalColor,
          metalColorHex: metalColor === "Gold" ? "#ffd700" : "#c0c0c0",
          size,
          sizeType: "RING",
        },
      }),
    ),
  );

  assert.equal(canUseGroupedVariantSelector(variants), true);
});

test("falls back to concrete choices when sibling variants omit axes", () => {
  const variants = [
    createVariant({
      options: { metalColor: "Silver", size: "Adjustable number 1" },
    }),
    createVariant({ options: { size: "Adjustable number 2" } }),
  ];

  assert.equal(canUseGroupedVariantSelector(variants), false);
});

test("falls back for empty options, duplicate tuples, and unknown keys", () => {
  assert.equal(
    canUseGroupedVariantSelector([createVariant({ options: {} })]),
    false,
  );

  assert.equal(
    canUseGroupedVariantSelector([
      createVariant({ options: { metalColor: "Silver" } }),
      createVariant({ options: { metalColor: " silver " } }),
    ]),
    false,
  );

  assert.equal(
    canUseGroupedVariantSelector([
      createVariant({ options: { metalColor: "Gold", length: "Short" } }),
    ]),
    false,
  );
});

test("keeps sparse, unique admin color and size combinations in grouped controls", () => {
  const variants = [
    createVariant({
      id: "gold-six",
      options: { metalColor: "Gold", metalColorHex: "#ffd700", size: "6" },
    }),
    createVariant({
      id: "silver-seven",
      options: {
        metalColor: "Silver",
        metalColorHex: "#c0c0c0",
        size: "7",
      },
    }),
  ];

  assert.equal(canUseGroupedVariantSelector(variants), true);
  assert.equal(
    findVariant(variants, { metalColor: "Silver", size: "7" }).id,
    "silver-seven",
  );
  assert.equal(findVariant(variants, { metalColor: "Gold", size: "7" }), null);
});

test("uses the exact admin color values and hex codes for customer swatches", () => {
  const variants = [
    createVariant({ options: { color: "Gold" } }),
    createVariant({
      options: { metalColor: " gold ", metalColorHex: "#D4AF37" },
    }),
    createVariant({
      options: { metalColor: "Silver", metalColorHex: "#C0C0C0" },
    }),
    createVariant({
      options: { stoneColor: "Ruby", stoneColorHex: "#B64242" },
    }),
  ];

  assert.deepEqual(getVariantColorChoices(variants, "metalColor"), [
    { value: "Gold", color: "#D4AF37" },
    { value: "Silver", color: "#C0C0C0" },
  ]);
  assert.deepEqual(getVariantColorChoices(variants, "stoneColor"), [
    { value: "Ruby", color: "#B64242" },
  ]);
});

test("accepts the supported color alias and metadata", () => {
  const variants = [
    createVariant({
      options: { color: "Gold", colorHex: "#ffd700", size: "6" },
    }),
    createVariant({
      options: { color: "Gold", colorHex: "#ffd700", size: "7" },
    }),
  ];

  assert.equal(canUseGroupedVariantSelector(variants), true);
});

test("selects an in-stock default, then any in-stock variant, before out-of-stock fallbacks", () => {
  const outOfStockDefault = createVariant({
    id: "out-default",
    isDefault: true,
    inStock: false,
    stockStatus: "OUT_OF_STOCK",
  });
  const inStock = createVariant({ id: "in-stock" });
  const inStockDefault = createVariant({
    id: "in-default",
    isDefault: true,
  });

  assert.equal(
    selectInitialVariant([outOfStockDefault, inStock, inStockDefault]).id,
    "in-default",
  );
  assert.equal(
    selectInitialVariant([outOfStockDefault, inStock]).id,
    "in-stock",
  );
  assert.equal(selectInitialVariant([outOfStockDefault]).id, "out-default");
  assert.equal(selectInitialVariant([]), null);
});

test("in-stock matching never resolves an out-of-stock concrete variant", () => {
  const outOfStock = createVariant({
    id: "silver-oos",
    options: { metalColor: "Silver" },
    inStock: false,
    stockStatus: "OUT_OF_STOCK",
  });
  const inStock = createVariant({
    id: "silver-stock",
    options: { metalColor: "Silver" },
  });

  assert.equal(
    findVariant(
      [outOfStock, inStock],
      { metalColor: "Silver" },
      { inStockOnly: true },
    ).id,
    "silver-stock",
  );
});

test("duplicate display names are disambiguated by SKU without changing IDs", () => {
  const variants = [
    createVariant({ id: "first", sku: "PHOTO-SILVER-1", displayName: "Silver" }),
    createVariant({ id: "second", sku: "PHOTO-SILVER-2", displayName: "Silver" }),
  ];
  const choices = getConcreteVariantChoices(variants);

  assert.deepEqual(choices, [
    {
      variantId: "first",
      displayName: "Silver",
      identifier: "PHOTO-SILVER-1",
      accessibleLabel: "Silver, SKU PHOTO-SILVER-1",
    },
    {
      variantId: "second",
      displayName: "Silver",
      identifier: "PHOTO-SILVER-2",
      accessibleLabel: "Silver, SKU PHOTO-SILVER-2",
    },
  ]);
  assert.deepEqual(
    choices.map((choice) => choice.variantId),
    ["first", "second"],
  );
});
