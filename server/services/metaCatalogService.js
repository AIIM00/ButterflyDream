import prisma from "../src/prisma.js";

const META_CATALOG_HEADERS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
  "item_group_id",
  "product_type",
  "color",
  "size",
];

const ACTIVE_VARIANT_WHERE = {
  isActive: true,
  archivedAt: null,
};

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replaceAll("\u0000", "").trim();
}

function escapeCsvValue(value) {
  const normalized = normalizeText(value).replaceAll('"', '""');

  return `"${normalized}"`;
}

function normalizeBaseUrl(value) {
  return normalizeText(value).replace(/\/+$/, "");
}

function readVariantOption(options, optionName) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return "";
  }

  const matchingKey = Object.keys(options).find(
    (key) => key.toLowerCase() === optionName.toLowerCase(),
  );

  if (!matchingKey) {
    return "";
  }

  return normalizeText(options[matchingKey]);
}

function getVariantImage(product, variantId) {
  const images = Array.isArray(product.images) ? product.images : [];

  return (
    images.find((image) => image.variantId === variantId) ??
    images.find((image) => image.isPrimary && !image.variantId) ??
    images.find((image) => !image.variantId) ??
    images.find((image) => image.isPrimary) ??
    images[0] ??
    null
  );
}

function buildVariantTitle(productName, variantDisplayName) {
  const product = normalizeText(productName);
  const variant = normalizeText(variantDisplayName);

  if (!variant || variant.toLowerCase() === product.toLowerCase()) {
    return product;
  }

  return `${product} - ${variant}`;
}

function formatMetaPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "";
  }

  return `${numericPrice.toFixed(2)} USD`;
}

function serializeMetaCatalogRow({ product, variant, clientUrl, brand }) {
  const image = getVariantImage(product, variant.id);

  if (!image?.imageUrl) {
    return null;
  }

  const stockQuantity = variant.inventory?.stockQuantity ?? 0;

  return {
    // Variant UUIDs are stable even if a merchant later edits the SKU.
    id: variant.id,
    title: buildVariantTitle(product.name, variant.displayName),
    description: product.description,
    availability: stockQuantity > 0 ? "in stock" : "out of stock",
    condition: "new",
    price: formatMetaPrice(variant.price),
    link: `${clientUrl}/products/${encodeURIComponent(product.slug)}`,
    image_link: image.imageUrl,
    brand,
    item_group_id: product.id,
    product_type: product.category?.name ?? "",
    color: readVariantOption(variant.options, "color"),
    size: readVariantOption(variant.options, "size"),
  };
}

export function buildMetaCatalogCsv(
  products,
  {
    clientUrl = process.env.CLIENT_URL ?? "https://butterflydream.cc",
    brand = process.env.META_CATALOG_BRAND ?? "Butterfly Dream",
  } = {},
) {
  const normalizedClientUrl = normalizeBaseUrl(clientUrl);
  const normalizedBrand = normalizeText(brand) || "Butterfly Dream";
  const rows = [];
  let skippedItems = 0;

  for (const product of products) {
    for (const variant of product.variants ?? []) {
      const row = serializeMetaCatalogRow({
        product,
        variant,
        clientUrl: normalizedClientUrl,
        brand: normalizedBrand,
      });

      if (!row) {
        skippedItems += 1;
        continue;
      }

      rows.push(row);
    }
  }

  const lines = [
    META_CATALOG_HEADERS.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      META_CATALOG_HEADERS.map((header) => escapeCsvValue(row[header])).join(","),
    ),
  ];

  return {
    // A UTF-8 BOM helps spreadsheet tools preserve non-Latin catalog text.
    csv: `\uFEFF${lines.join("\r\n")}\r\n`,
    itemCount: rows.length,
    skippedItems,
  };
}

export async function getMetaCatalogCsv(options = {}) {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      archivedAt: null,
      category: {
        is: {
          isActive: true,
        },
      },
      variants: {
        some: ACTIVE_VARIANT_WHERE,
      },
    },
    orderBy: [
      {
        createdAt: "asc",
      },
      {
        id: "asc",
      },
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: {
        select: {
          name: true,
        },
      },
      images: {
        orderBy: [
          {
            isPrimary: "desc",
          },
          {
            position: "asc",
          },
          {
            id: "asc",
          },
        ],
        select: {
          variantId: true,
          imageUrl: true,
          isPrimary: true,
          position: true,
        },
      },
      variants: {
        where: ACTIVE_VARIANT_WHERE,
        orderBy: [
          {
            isDefault: "desc",
          },
          {
            displayName: "asc",
          },
          {
            id: "asc",
          },
        ],
        select: {
          id: true,
          sku: true,
          displayName: true,
          options: true,
          price: true,
          inventory: {
            select: {
              stockQuantity: true,
            },
          },
        },
      },
    },
  });

  return buildMetaCatalogCsv(products, options);
}
