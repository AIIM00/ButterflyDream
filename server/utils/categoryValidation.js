const CATEGORY_ID_MAX_LENGTH = 191;
const CATEGORY_NAME_MAX_LENGTH = 100;
const CATEGORY_SLUG_MAX_LENGTH = 120;
const CATEGORY_DESCRIPTION_MAX_LENGTH = 1000;
const MAX_DISPLAY_ORDER = 100_000;

const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CategoryValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "CategoryValidationError";
    this.statusCode = 400;
  }
}

function hasOwn(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

function validatePlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CategoryValidationError("A valid request body is required.");
  }
}

function parseCategoryName(value) {
  if (typeof value !== "string") {
    throw new CategoryValidationError("Category name is required.");
  }

  const normalizedName = value.trim();

  if (
    normalizedName.length < 2 ||
    normalizedName.length > CATEGORY_NAME_MAX_LENGTH
  ) {
    throw new CategoryValidationError(
      `Category name must contain between 2 and ${CATEGORY_NAME_MAX_LENGTH} characters.`,
    );
  }

  return normalizedName;
}

export function createCategorySlug(value) {
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
    .slice(0, CATEGORY_SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
}

function parseCategorySlug(value, fallbackName) {
  const source =
    typeof value === "string" && value.trim() ? value : fallbackName;

  const slug = createCategorySlug(source);

  if (
    !slug ||
    slug.length > CATEGORY_SLUG_MAX_LENGTH ||
    !CATEGORY_SLUG_PATTERN.test(slug)
  ) {
    throw new CategoryValidationError(
      "Category slug must contain lowercase letters, numbers, and single hyphens.",
    );
  }

  return slug;
}

function parseDescription(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new CategoryValidationError("Category description must be text.");
  }

  const normalizedDescription = value.trim();

  if (!normalizedDescription) {
    return null;
  }

  if (normalizedDescription.length > CATEGORY_DESCRIPTION_MAX_LENGTH) {
    throw new CategoryValidationError(
      `Category description must not exceed ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters.`,
    );
  }

  return normalizedDescription;
}

function parseBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw new CategoryValidationError(`${fieldName} must be true or false.`);
  }

  return value;
}

function parseDisplayOrder(value) {
  if (!Number.isInteger(value) || value < 0 || value > MAX_DISPLAY_ORDER) {
    throw new CategoryValidationError(
      `Display order must be an integer between 0 and ${MAX_DISPLAY_ORDER}.`,
    );
  }

  return value;
}

export function parseCategoryId(value) {
  const categoryId = typeof value === "string" ? value.trim() : "";

  if (!categoryId || categoryId.length > CATEGORY_ID_MAX_LENGTH) {
    throw new CategoryValidationError("The category ID is invalid.");
  }

  return categoryId;
}

export function parseCreateCategoryInput(body) {
  validatePlainObject(body);

  const name = parseCategoryName(body.name);

  return {
    name,

    slug: parseCategorySlug(body.slug, name),

    description: parseDescription(body.description),

    isActive:
      body.isActive === undefined
        ? true
        : parseBoolean(body.isActive, "Category active status"),

    displayOrder:
      body.displayOrder === undefined
        ? undefined
        : parseDisplayOrder(body.displayOrder),
  };
}

export function parseUpdateCategoryInput(body) {
  validatePlainObject(body);

  const updateData = {};

  if (hasOwn(body, "name")) {
    updateData.name = parseCategoryName(body.name);
  }

  if (hasOwn(body, "slug")) {
    updateData.slug = parseCategorySlug(body.slug, updateData.name);
  }

  if (hasOwn(body, "description")) {
    updateData.description = parseDescription(body.description);
  }

  if (hasOwn(body, "displayOrder")) {
    updateData.displayOrder = parseDisplayOrder(body.displayOrder);
  }

  if (Object.keys(updateData).length === 0) {
    throw new CategoryValidationError(
      "Provide at least one category field to update.",
    );
  }

  return updateData;
}

export function parseCategoryStatusInput(body) {
  validatePlainObject(body);

  return {
    isActive: parseBoolean(body.isActive, "Category active status"),

    confirmHideProducts:
      body.confirmHideProducts === undefined
        ? false
        : parseBoolean(body.confirmHideProducts, "Product-hiding confirmation"),
  };
}

export function parseCategoryReorderInput(body) {
  validatePlainObject(body);

  if (!Array.isArray(body.categoryIds)) {
    throw new CategoryValidationError("categoryIds must be an array.");
  }

  if (body.categoryIds.length === 0) {
    throw new CategoryValidationError(
      "categoryIds must contain at least one category ID.",
    );
  }

  const categoryIds = body.categoryIds.map(parseCategoryId);

  const uniqueCategoryIds = new Set(categoryIds);

  if (uniqueCategoryIds.size !== categoryIds.length) {
    throw new CategoryValidationError(
      "categoryIds must not contain duplicate IDs.",
    );
  }

  return {
    categoryIds,
  };
}
