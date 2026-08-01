import { ProductStatus } from "@prisma/client";

const ID_MAX_LENGTH = 191;
const PRODUCT_NAME_MAX_LENGTH = 160;
const PRODUCT_SLUG_MAX_LENGTH = 180;
const PRODUCT_DESCRIPTION_MAX_LENGTH = 5000;
const VARIANT_NAME_MAX_LENGTH = 160;
const SKU_MAX_LENGTH = 100;
const ALT_TEXT_MAX_LENGTH = 300;
const IMAGE_URL_MAX_LENGTH = 2048;

const MAX_VARIANTS_PER_PRODUCT = 100;
const MAX_IMAGES_PER_PRODUCT = 50;
const MAX_STOCK_QUANTITY = 10_000_000;
const MAX_LOW_STOCK_THRESHOLD = 1_000_000;
const MAX_IMAGE_POSITION = 100_000;
const MAX_PRICE = 1_000_000;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SKU_PATTERN = /^[A-Z0-9][A-Z0-9._-]*$/;

const PRODUCT_SORT_OPTIONS = new Set([
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
]);

const PRODUCT_STATUS_VALUES = Object.values(ProductStatus);

const DEFAULT_PRODUCT_STATUS = ProductStatus.DRAFT ?? PRODUCT_STATUS_VALUES[0];

export class AdminProductValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AdminProductValidationError";
    this.statusCode = 400;
  }
}

function hasOwn(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

function validatePlainObject(
  value,
  message = "A valid request body is required.",
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AdminProductValidationError(message);
  }
}

function parseId(value, fieldName) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (!normalizedValue || normalizedValue.length > ID_MAX_LENGTH) {
    throw new AdminProductValidationError(`${fieldName} is invalid.`);
  }

  return normalizedValue;
}

function parseRequiredText(value, { fieldName, minimum = 1, maximum }) {
  if (typeof value !== "string") {
    throw new AdminProductValidationError(`${fieldName} is required.`);
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length < minimum || normalizedValue.length > maximum) {
    throw new AdminProductValidationError(
      `${fieldName} must contain between ${minimum} and ${maximum} characters.`,
    );
  }

  return normalizedValue;
}

function parseOptionalText(value, { fieldName, maximum }) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new AdminProductValidationError(`${fieldName} must be text.`);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.length > maximum) {
    throw new AdminProductValidationError(
      `${fieldName} must not exceed ${maximum} characters.`,
    );
  }

  return normalizedValue;
}

function parseBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw new AdminProductValidationError(
      `${fieldName} must be true or false.`,
    );
  }

  return value;
}

function parseNonNegativeInteger(value, { fieldName, maximum }) {
  if (!Number.isInteger(value) || value < 0 || value > maximum) {
    throw new AdminProductValidationError(
      `${fieldName} must be an integer between 0 and ${maximum}.`,
    );
  }

  return value;
}

function parsePositiveIntegerQuery(
  value,
  { fieldName, defaultValue, maximum },
) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const rawValue = Array.isArray(value) ? value[0] : value;

  const parsedValue = Number(rawValue);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 1 ||
    parsedValue > maximum
  ) {
    throw new AdminProductValidationError(
      `${fieldName} must be an integer between 1 and ${maximum}.`,
    );
  }

  return parsedValue;
}

function parseOptionalBooleanQuery(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const rawValue = Array.isArray(value) ? value[0] : value;

  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  throw new AdminProductValidationError(`${fieldName} must be true or false.`);
}

export function createProductSlug(value) {
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
    .slice(0, PRODUCT_SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
}

function parseProductSlug(value, fallbackName) {
  const source =
    typeof value === "string" && value.trim() ? value : fallbackName;

  const slug = createProductSlug(source);

  if (
    !slug ||
    slug.length > PRODUCT_SLUG_MAX_LENGTH ||
    !SLUG_PATTERN.test(slug)
  ) {
    throw new AdminProductValidationError(
      "Product slug must contain lowercase letters, numbers, and single hyphens.",
    );
  }

  return slug;
}

function parseSku(value) {
  const sku = parseRequiredText(value, {
    fieldName: "Variant SKU",
    minimum: 1,
    maximum: SKU_MAX_LENGTH,
  }).toUpperCase();

  if (!SKU_PATTERN.test(sku)) {
    throw new AdminProductValidationError(
      "Variant SKU may contain uppercase letters, numbers, periods, underscores, and hyphens.",
    );
  }

  return sku;
}

function parsePrice(value) {
  const normalizedValue =
    typeof value === "number"
      ? String(value)
      : typeof value === "string"
        ? value.trim()
        : "";

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalizedValue)) {
    throw new AdminProductValidationError(
      "Variant price must be a valid USD amount with no more than two decimal places.",
    );
  }

  const numericValue = Number(normalizedValue);

  if (
    !Number.isFinite(numericValue) ||
    numericValue < 0 ||
    numericValue > MAX_PRICE
  ) {
    throw new AdminProductValidationError(
      `Variant price must be between 0 and ${MAX_PRICE}.`,
    );
  }

  return normalizedValue;
}

function parseOptions(value) {
  if (value === undefined || value === null) {
    return {};
  }

  validatePlainObject(value, "Variant options must be an object.");

  for (const [name, optionValue] of Object.entries(value)) {
    if (!name.trim() || name.length > 100) {
      throw new AdminProductValidationError(
        "Variant option names must contain between 1 and 100 characters.",
      );
    }

    const validValue =
      typeof optionValue === "string" ||
      typeof optionValue === "number" ||
      typeof optionValue === "boolean";

    if (!validValue) {
      throw new AdminProductValidationError(
        "Variant option values must be text, numbers, or booleans.",
      );
    }
  }

  return value;
}

function parseImageUrl(value) {
  const imageUrl = parseRequiredText(value, {
    fieldName: "Image URL",
    minimum: 1,
    maximum: IMAGE_URL_MAX_LENGTH,
  });

  let parsedUrl;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    throw new AdminProductValidationError("Image URL must be valid.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new AdminProductValidationError("Image URL must use HTTP or HTTPS.");
  }

  return parsedUrl.toString();
}

function parseProductStatus(value) {
  if (typeof value !== "string" || !PRODUCT_STATUS_VALUES.includes(value)) {
    throw new AdminProductValidationError(
      `Product status must be one of: ${PRODUCT_STATUS_VALUES.join(", ")}.`,
    );
  }

  return value;
}

function parseVariantCreateInput(value, index) {
  validatePlainObject(value, `Variant ${index + 1} must be an object.`);

  return {
    sku: parseSku(value.sku),

    displayName: parseRequiredText(value.displayName, {
      fieldName: `Variant ${index + 1} display name`,
      minimum: 1,
      maximum: VARIANT_NAME_MAX_LENGTH,
    }),

    options: parseOptions(value.options),

    price: parsePrice(value.price),

    isDefault:
      value.isDefault === undefined
        ? false
        : parseBoolean(value.isDefault, `Variant ${index + 1} default status`),

    isActive:
      value.isActive === undefined
        ? true
        : parseBoolean(value.isActive, `Variant ${index + 1} active status`),

    stockQuantity:
      value.stockQuantity === undefined
        ? 0
        : parseNonNegativeInteger(value.stockQuantity, {
            fieldName: `Variant ${index + 1} stock quantity`,
            maximum: MAX_STOCK_QUANTITY,
          }),

    lowStockThreshold:
      value.lowStockThreshold === undefined
        ? 5
        : parseNonNegativeInteger(value.lowStockThreshold, {
            fieldName: `Variant ${index + 1} low-stock threshold`,
            maximum: MAX_LOW_STOCK_THRESHOLD,
          }),
  };
}

function parseInitialImageInput(value, index) {
  validatePlainObject(value, `Image ${index + 1} must be an object.`);

  return {
    imageUrl: parseImageUrl(value.imageUrl),

    altText: parseOptionalText(value.altText, {
      fieldName: `Image ${index + 1} alternative text`,
      maximum: ALT_TEXT_MAX_LENGTH,
    }),

    isPrimary:
      value.isPrimary === undefined
        ? false
        : parseBoolean(value.isPrimary, `Image ${index + 1} primary status`),
  };
}

export function parseProductId(value) {
  return parseId(value, "Product ID");
}

export function parseVariantId(value) {
  return parseId(value, "Variant ID");
}

export function parseImageId(value) {
  return parseId(value, "Image ID");
}

export function parseCreateProductInput(body) {
  validatePlainObject(body);

  const name = parseRequiredText(body.name, {
    fieldName: "Product name",
    minimum: 2,
    maximum: PRODUCT_NAME_MAX_LENGTH,
  });

  const status =
    body.status === undefined
      ? DEFAULT_PRODUCT_STATUS
      : parseProductStatus(body.status);

  const variants = Array.isArray(body.variants)
    ? body.variants.map(parseVariantCreateInput)
    : [];

  if (variants.length < 1 || variants.length > MAX_VARIANTS_PER_PRODUCT) {
    throw new AdminProductValidationError(
      `A product must contain between 1 and ${MAX_VARIANTS_PER_PRODUCT} variants.`,
    );
  }

  const skus = variants.map((variant) => variant.sku);

  if (new Set(skus).size !== skus.length) {
    throw new AdminProductValidationError(
      "Variant SKUs must be unique within the product.",
    );
  }

  // An ACTIVE product must have at least one active variant.
  if (status === "ACTIVE" && !variants.some((variant) => variant.isActive)) {
    throw new AdminProductValidationError(
      "An active product must contain at least one active variant.",
    );
  }

  const defaultVariants = variants.filter((variant) => variant.isDefault);

  if (defaultVariants.length > 1) {
    throw new AdminProductValidationError(
      "Only one variant may be marked as the default.",
    );
  }

  // Automatically choose the first active variant as default.
  if (defaultVariants.length === 0) {
    const firstActiveVariant = variants.find((variant) => variant.isActive);

    if (!firstActiveVariant) {
      throw new AdminProductValidationError(
        "A product must contain at least one active variant.",
      );
    }

    firstActiveVariant.isDefault = true;
  }

  const finalDefaultVariant = variants.find((variant) => variant.isDefault);

  if (!finalDefaultVariant?.isActive) {
    throw new AdminProductValidationError(
      "The default variant must be active.",
    );
  }

  const images =
    body.images === undefined
      ? []
      : Array.isArray(body.images)
        ? body.images.map(parseInitialImageInput)
        : null;

  if (!images) {
    throw new AdminProductValidationError("Product images must be an array.");
  }

  if (images.length > MAX_IMAGES_PER_PRODUCT) {
    throw new AdminProductValidationError(
      `A product may contain no more than ${MAX_IMAGES_PER_PRODUCT} initial images.`,
    );
  }

  const primaryImages = images.filter((image) => image.isPrimary);

  if (primaryImages.length > 1) {
    throw new AdminProductValidationError(
      "Only one product image may be marked as primary.",
    );
  }

  if (images.length > 0 && primaryImages.length === 0) {
    images[0].isPrimary = true;
  }

  return {
    categoryId: parseId(body.categoryId, "Category ID"),

    name,

    slug: parseProductSlug(body.slug, name),

    description:
      parseOptionalText(body.description, {
        fieldName: "Product description",
        maximum: PRODUCT_DESCRIPTION_MAX_LENGTH,
      }) ?? "",

    status,

    isFeatured:
      body.isFeatured === undefined
        ? false
        : parseBoolean(body.isFeatured, "Featured status"),

    variants,
    images,
  };
}

export function parseUpdateProductInput(body) {
  validatePlainObject(body);

  const data = {};

  if (hasOwn(body, "categoryId")) {
    data.categoryId = parseId(body.categoryId, "Category ID");
  }

  if (hasOwn(body, "name")) {
    data.name = parseRequiredText(body.name, {
      fieldName: "Product name",
      minimum: 2,
      maximum: PRODUCT_NAME_MAX_LENGTH,
    });
  }

  if (hasOwn(body, "slug")) {
    data.slug = parseProductSlug(body.slug, data.name);
  }

  if (hasOwn(body, "description")) {
    data.description =
      parseOptionalText(body.description, {
        fieldName: "Product description",
        maximum: PRODUCT_DESCRIPTION_MAX_LENGTH,
      }) ?? "";
  }

  if (hasOwn(body, "isFeatured")) {
    data.isFeatured = parseBoolean(body.isFeatured, "Featured status");
  }

  if (Object.keys(data).length === 0) {
    throw new AdminProductValidationError(
      "Provide at least one product field to update.",
    );
  }

  return data;
}

export function parseProductStatusInput(body) {
  validatePlainObject(body);

  return {
    status: parseProductStatus(body.status),
  };
}

export function parseCreateVariantInput(body) {
  return parseVariantCreateInput(body, 0);
}

export function parseUpdateVariantInput(body) {
  validatePlainObject(body);

  const data = {};

  if (hasOwn(body, "sku")) {
    data.sku = parseSku(body.sku);
  }

  if (hasOwn(body, "displayName")) {
    data.displayName = parseRequiredText(body.displayName, {
      fieldName: "Variant display name",
      minimum: 1,
      maximum: VARIANT_NAME_MAX_LENGTH,
    });
  }

  if (hasOwn(body, "options")) {
    data.options = parseOptions(body.options);
  }

  if (hasOwn(body, "price")) {
    data.price = parsePrice(body.price);
  }

  if (hasOwn(body, "isDefault")) {
    const isDefault = parseBoolean(body.isDefault, "Default variant status");

    if (!isDefault) {
      throw new AdminProductValidationError(
        "To change the default variant, mark another variant as the default.",
      );
    }

    data.isDefault = true;
  }

  if (Object.keys(data).length === 0) {
    throw new AdminProductValidationError(
      "Provide at least one variant field to update.",
    );
  }

  return data;
}

export function parseVariantStatusInput(body) {
  validatePlainObject(body);

  return {
    isActive: parseBoolean(body.isActive, "Variant active status"),
  };
}

export function parseInventoryInput(body) {
  validatePlainObject(body);

  const data = {};

  if (hasOwn(body, "stockQuantity")) {
    data.stockQuantity = parseNonNegativeInteger(body.stockQuantity, {
      fieldName: "Stock quantity",
      maximum: MAX_STOCK_QUANTITY,
    });
  }

  if (hasOwn(body, "lowStockThreshold")) {
    data.lowStockThreshold = parseNonNegativeInteger(body.lowStockThreshold, {
      fieldName: "Low-stock threshold",
      maximum: MAX_LOW_STOCK_THRESHOLD,
    });
  }

  if (Object.keys(data).length === 0) {
    throw new AdminProductValidationError(
      "Provide stockQuantity or lowStockThreshold.",
    );
  }

  return data;
}

export function parseCreateImageInput(body) {
  validatePlainObject(body);

  return {
    variantId:
      body.variantId === undefined ||
      body.variantId === null ||
      body.variantId === ""
        ? null
        : parseVariantId(body.variantId),

    imageUrl: parseImageUrl(body.imageUrl),

    altText: parseOptionalText(body.altText, {
      fieldName: "Image alternative text",
      maximum: ALT_TEXT_MAX_LENGTH,
    }),

    isPrimary:
      body.isPrimary === undefined
        ? false
        : parseBoolean(body.isPrimary, "Primary image status"),

    position:
      body.position === undefined
        ? undefined
        : parseNonNegativeInteger(body.position, {
            fieldName: "Image position",
            maximum: MAX_IMAGE_POSITION,
          }),
  };
}

export function parseUpdateImageInput(body) {
  validatePlainObject(body);

  const data = {};

  if (hasOwn(body, "variantId")) {
    data.variantId =
      body.variantId === null || body.variantId === ""
        ? null
        : parseVariantId(body.variantId);
  }

  if (hasOwn(body, "imageUrl")) {
    data.imageUrl = parseImageUrl(body.imageUrl);
  }

  if (hasOwn(body, "altText")) {
    data.altText = parseOptionalText(body.altText, {
      fieldName: "Image alternative text",
      maximum: ALT_TEXT_MAX_LENGTH,
    });
  }

  if (hasOwn(body, "position")) {
    data.position = parseNonNegativeInteger(body.position, {
      fieldName: "Image position",
      maximum: MAX_IMAGE_POSITION,
    });
  }

  if (hasOwn(body, "isPrimary")) {
    const isPrimary = parseBoolean(body.isPrimary, "Primary image status");

    if (!isPrimary) {
      throw new AdminProductValidationError(
        "To change the primary image, mark another image as primary.",
      );
    }

    data.isPrimary = true;
  }

  if (Object.keys(data).length === 0) {
    throw new AdminProductValidationError(
      "Provide at least one image field to update.",
    );
  }

  return data;
}

export function parseAdminProductListQuery(query) {
  const page = parsePositiveIntegerQuery(query.page, {
    fieldName: "Page",
    defaultValue: 1,
    maximum: 100_000,
  });

  const limit = parsePositiveIntegerQuery(query.limit, {
    fieldName: "Limit",
    defaultValue: 20,
    maximum: 100,
  });

  const rawSearch = Array.isArray(query.search)
    ? query.search[0]
    : query.search;

  const search = typeof rawSearch === "string" ? rawSearch.trim() : "";

  if (search.length > 100) {
    throw new AdminProductValidationError(
      "Search must not exceed 100 characters.",
    );
  }

  const rawSort = Array.isArray(query.sort) ? query.sort[0] : query.sort;

  const sort = typeof rawSort === "string" && rawSort ? rawSort : "newest";

  if (!PRODUCT_SORT_OPTIONS.has(sort)) {
    throw new AdminProductValidationError(
      `Sort must be one of: ${[...PRODUCT_SORT_OPTIONS].join(", ")}.`,
    );
  }

  let status;

  if (query.status !== undefined && query.status !== "") {
    const rawStatus = Array.isArray(query.status)
      ? query.status[0]
      : query.status;

    status = parseProductStatus(rawStatus);
  }

  const rawCategoryId = Array.isArray(query.categoryId)
    ? query.categoryId[0]
    : query.categoryId;

  return {
    page,
    limit,
    skip: (page - 1) * limit,

    search: search || undefined,

    categoryId: rawCategoryId
      ? parseId(rawCategoryId, "Category ID")
      : undefined,

    status,

    archived: parseOptionalBooleanQuery(query.archived, "Archived") ?? false,

    sort,
  };
}
