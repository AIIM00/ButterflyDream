export const PRODUCT_STATUS_OPTIONS = ["DRAFT", "ACTIVE", "INACTIVE"];

export function createAdminProductSlug(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180)
    .replace(/-+$/g, "");
}

export function createLocalId() {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function parseVariantOptions(optionsText) {
  const normalizedText = optionsText.trim();

  if (!normalizedText) {
    return {};
  }

  let parsedOptions;

  try {
    parsedOptions = JSON.parse(normalizedText);
  } catch {
    throw new Error("Variant options must contain valid JSON.");
  }

  if (
    !parsedOptions ||
    typeof parsedOptions !== "object" ||
    Array.isArray(parsedOptions)
  ) {
    throw new Error("Variant options must be a JSON object.");
  }

  for (const value of Object.values(parsedOptions)) {
    const validValue =
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean";

    if (!validValue) {
      throw new Error(
        "Variant option values must be text, numbers, or booleans.",
      );
    }
  }

  return parsedOptions;
}

export function createVariantFormState(variant = null) {
  return {
    sku: variant?.sku ?? "",
    displayName: variant?.displayName ?? "",
    optionsText: JSON.stringify(variant?.options ?? {}, null, 2),
    price: variant?.price ?? "",
    isDefault: variant?.isDefault ?? false,
    isActive: variant?.isActive ?? true,
    stockQuantity: String(variant?.inventory?.stockQuantity ?? 0),
    lowStockThreshold: String(variant?.inventory?.lowStockThreshold ?? 5),
  };
}

export function createImageFormState(image = null) {
  return {
    variantId: image?.variantId ?? "",
    imageUrl: image?.imageUrl ?? "",
    altText: image?.altText ?? "",
    position: String(image?.position ?? 0),
    isPrimary: image?.isPrimary ?? false,
  };
}

function parseNonNegativeInteger(value, label) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }

  return number;
}

export function buildVariantPayload(formData) {
  const sku = formData.sku.trim().toUpperCase();
  const displayName = formData.displayName.trim();
  const price = formData.price.trim();

  if (!sku) {
    throw new Error("Variant SKU is required.");
  }

  if (!/^[A-Z0-9][A-Z0-9._-]*$/.test(sku)) {
    throw new Error(
      "SKU may contain uppercase letters, numbers, periods, underscores, and hyphens.",
    );
  }

  if (!displayName) {
    throw new Error("Variant display name is required.");
  }

  if (!/^\d+(?:\.\d{1,2})?$/.test(price)) {
    throw new Error("Variant price must be a valid USD amount.");
  }

  return {
    sku,
    displayName,
    options: parseVariantOptions(formData.optionsText),
    price,
    isDefault: formData.isDefault,
    isActive: formData.isActive,
    stockQuantity: parseNonNegativeInteger(
      formData.stockQuantity,
      "Stock quantity",
    ),
    lowStockThreshold: parseNonNegativeInteger(
      formData.lowStockThreshold,
      "Low-stock threshold",
    ),
  };
}

export function buildImagePayload(formData, includeVariant = true) {
  const imageUrl = formData.imageUrl.trim();

  if (!imageUrl) {
    throw new Error("Image URL is required.");
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    throw new Error("Enter a valid image URL.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Image URL must use HTTP or HTTPS.");
  }

  const payload = {
    imageUrl: parsedUrl.toString(),
    altText: formData.altText.trim() || null,
    position: parseNonNegativeInteger(formData.position, "Image position"),
    isPrimary: formData.isPrimary,
  };

  if (includeVariant) {
    payload.variantId = formData.variantId || null;
  }

  return payload;
}

export function buildProductCreatePayload({ formData, variants, images }) {
  const name = formData.name.trim();
  const slug = formData.slug.trim();
  const categoryId = formData.categoryId.trim();

  if (name.length < 2) {
    throw new Error("Product name must contain at least two characters.");
  }

  if (!slug) {
    throw new Error("Product slug is required.");
  }

  if (!categoryId) {
    throw new Error("Select a category.");
  }

  if (variants.length === 0) {
    throw new Error("Add at least one product variant.");
  }

  const variantPayloads = variants.map((variant) => ({
    sku: variant.sku,
    displayName: variant.displayName,
    options: variant.options,
    price: variant.price,
    isDefault: variant.isDefault,
    isActive: variant.isActive,
    stockQuantity: variant.stockQuantity,
    lowStockThreshold: variant.lowStockThreshold,
  }));

  const skuSet = new Set(
    variantPayloads.map((variant) => variant.sku.toUpperCase()),
  );

  if (skuSet.size !== variantPayloads.length) {
    throw new Error("Variant SKUs must be unique.");
  }

  if (!variantPayloads.some((variant) => variant.isDefault)) {
    variantPayloads[0].isDefault = true;
  }

  const imagePayloads = images.map((image, index) => ({
    imageUrl: image.imageUrl,
    altText: image.altText,
    isPrimary:
      image.isPrimary || (index === 0 && !images.some((i) => i.isPrimary)),
  }));

  return {
    categoryId,
    name,
    slug,
    description: formData.description.trim() || null,
    status: formData.status,
    isFeatured: formData.isFeatured,
    variants: variantPayloads,
    images: imagePayloads,
  };
}
