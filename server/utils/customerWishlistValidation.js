export class CustomerWishlistValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "CustomerWishlistValidationError";
    this.statusCode = 400;
  }
}

function validatePlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CustomerWishlistValidationError(
      "A valid request body is required.",
    );
  }
}

function parseId(value, fieldName) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (!normalizedValue) {
    throw new CustomerWishlistValidationError(`${fieldName} is invalid.`);
  }

  return normalizedValue;
}

export function parseAddWishlistItemInput(body) {
  validatePlainObject(body);

  return {
    productId: parseId(body.productId, "Product ID"),
  };
}

export function parseWishlistProductId(value) {
  return parseId(value, "Product ID");
}
