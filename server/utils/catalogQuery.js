const PRODUCT_SORT_OPTIONS = new Set([
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
  "price_asc",
  "price_desc",
]);

const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CatalogQueryError extends Error {
  constructor(message) {
    super(message);
    this.name = "CatalogQueryError";
    this.statusCode = 400;
  }
}

function getSingleQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parsePositiveInteger(
  value,
  { fieldName, defaultValue, minimum = 1, maximum },
) {
  const rawValue = getSingleQueryValue(value);

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return defaultValue;
  }

  const parsedValue = Number(rawValue);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < minimum ||
    parsedValue > maximum
  ) {
    throw new CatalogQueryError(
      `${fieldName} must be an integer between ${minimum} and ${maximum}.`,
    );
  }

  return parsedValue;
}

function parseOptionalBoolean(value, fieldName) {
  const rawValue = getSingleQueryValue(value);

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return undefined;
  }

  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  throw new CatalogQueryError(`${fieldName} must be true or false.`);
}

function parseOptionalPrice(value, fieldName) {
  const rawValue = getSingleQueryValue(value);

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return undefined;
  }

  const normalizedValue = String(rawValue).trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalizedValue)) {
    throw new CatalogQueryError(
      `${fieldName} must be a valid USD amount with no more than two decimal places.`,
    );
  }

  const numericValue = Number(normalizedValue);

  if (
    !Number.isFinite(numericValue) ||
    numericValue < 0 ||
    numericValue > 1_000_000
  ) {
    throw new CatalogQueryError(`${fieldName} must be between 0 and 1000000.`);
  }

  return normalizedValue;
}

function parseSearch(value) {
  const rawValue = getSingleQueryValue(value);

  if (rawValue === undefined || rawValue === null) {
    return undefined;
  }

  const normalizedValue = String(rawValue).trim();

  if (!normalizedValue) {
    return undefined;
  }

  if (normalizedValue.length > 100) {
    throw new CatalogQueryError("Search must not exceed 100 characters.");
  }

  return normalizedValue;
}

function parseCategorySlug(value) {
  const rawValue = getSingleQueryValue(value);

  if (rawValue === undefined || rawValue === null) {
    return undefined;
  }

  const normalizedValue = String(rawValue).trim().toLowerCase();

  if (!normalizedValue) {
    return undefined;
  }

  if (
    normalizedValue.length > 120 ||
    !CATEGORY_SLUG_PATTERN.test(normalizedValue)
  ) {
    throw new CatalogQueryError("Category must be a valid category slug.");
  }

  return normalizedValue;
}

function parseSort(value) {
  const rawValue = getSingleQueryValue(value);

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return "newest";
  }

  const normalizedValue = String(rawValue).trim();

  if (!PRODUCT_SORT_OPTIONS.has(normalizedValue)) {
    throw new CatalogQueryError(
      `Sort must be one of: ${[...PRODUCT_SORT_OPTIONS].join(", ")}.`,
    );
  }

  return normalizedValue;
}

export function parseProductCatalogQuery(query) {
  const page = parsePositiveInteger(query.page, {
    fieldName: "Page",
    defaultValue: 1,
    maximum: 100_000,
  });

  const limit = parsePositiveInteger(query.limit, {
    fieldName: "Limit",
    defaultValue: 12,
    maximum: 48,
  });

  const minPrice = parseOptionalPrice(query.minPrice, "Minimum price");

  const maxPrice = parseOptionalPrice(query.maxPrice, "Maximum price");

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    Number(minPrice) > Number(maxPrice)
  ) {
    throw new CatalogQueryError(
      "Minimum price cannot be greater than maximum price.",
    );
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,

    search: parseSearch(query.search ?? query.q),

    category: parseCategorySlug(query.category),

    featured: parseOptionalBoolean(query.featured, "Featured"),

    inStock: parseOptionalBoolean(query.inStock, "In-stock"),

    minPrice,
    maxPrice,
    sort: parseSort(query.sort),
  };
}

export function parseProductSlug(value) {
  const normalizedValue =
    typeof value === "string" ? value.trim().toLowerCase() : "";

  if (
    !normalizedValue ||
    normalizedValue.length > 160 ||
    !CATEGORY_SLUG_PATTERN.test(normalizedValue)
  ) {
    throw new CatalogQueryError("The product slug is invalid.");
  }

  return normalizedValue;
}
