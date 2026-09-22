import { describe, expect, test } from "vitest";
import { buildMetaCatalogCsv } from "../services/metaCatalogService.js";

describe("Meta catalog CSV", () => {
  test("builds one feed row per active product variant", () => {
    const products = [
      {
        id: "product-1",
        name: "Butterfly Bracelet",
        slug: "butterfly-bracelet",
        description: 'Lightweight bracelet, "gold finish".',
        category: {
          name: "Bracelets",
        },
        images: [
          {
            variantId: null,
            imageUrl: "https://cdn.example.com/default.jpg",
            isPrimary: true,
            position: 0,
          },
          {
            variantId: "variant-pink",
            imageUrl: "https://cdn.example.com/pink.jpg",
            isPrimary: false,
            position: 1,
          },
        ],
        variants: [
          {
            id: "variant-pink",
            sku: "BRACELET-PINK",
            displayName: "Pink / Small",
            options: {
              Color: "Pink",
              Size: "S",
            },
            price: 12,
            inventory: {
              stockQuantity: 3,
            },
          },
          {
            id: "variant-black",
            sku: "BRACELET-BLACK",
            displayName: "Black / Medium",
            options: {
              color: "Black",
              size: "M",
            },
            price: 14.5,
            inventory: {
              stockQuantity: 0,
            },
          },
        ],
      },
    ];

    const result = buildMetaCatalogCsv(products, {
      clientUrl: "https://butterflydream.cc/",
      brand: "Butterfly Dream",
    });

    expect(result.itemCount).toBe(2);
    expect(result.skippedItems).toBe(0);
    expect(result.csv).toContain('"id","title","description"');
    expect(result.csv).toContain('"variant-pink"');
    expect(result.csv).toContain('"Butterfly Bracelet - Pink / Small"');
    expect(result.csv).toContain('"Lightweight bracelet, ""gold finish""."');
    expect(result.csv).toContain('"in stock"');
    expect(result.csv).toContain('"12.00 USD"');
    expect(result.csv).toContain('"https://butterflydream.cc/products/butterfly-bracelet"');
    expect(result.csv).toContain('"https://cdn.example.com/pink.jpg"');
    expect(result.csv).toContain('"Pink"');
    expect(result.csv).toContain('"S"');
    expect(result.csv).toContain('"variant-black"');
    expect(result.csv).toContain('"out of stock"');
    expect(result.csv).toContain('"14.50 USD"');
    expect(result.csv).toContain('"https://cdn.example.com/default.jpg"');
  });

  test("skips variants that do not have a usable image", () => {
    const result = buildMetaCatalogCsv([
      {
        id: "product-without-image",
        name: "No Image Product",
        slug: "no-image-product",
        description: "This item has no image yet.",
        category: {
          name: "Accessories",
        },
        images: [],
        variants: [
          {
            id: "variant-without-image",
            sku: "NO-IMAGE",
            displayName: "Default",
            options: {},
            price: 5,
            inventory: {
              stockQuantity: 1,
            },
          },
        ],
      },
    ]);

    expect(result.itemCount).toBe(0);
    expect(result.skippedItems).toBe(1);
  });
});
