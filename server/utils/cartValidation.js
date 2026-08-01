const ID_MAX_LENGTH = 191;
const MAX_CART_ITEM_QUANTITY = 99;

export class CartValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "CartValidationError";
    this.statusCode = 400;
  }
}

function validatePlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CartValidationError("A valid request body is required.");
  }
}

function parseId(value, fieldName) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (!normalizedValue || normalizedValue.length > ID_MAX_LENGTH) {
    throw new CartValidationError(`${fieldName} is invalid.`);
  }

  return normalizedValue;
}

function parseQuantity(value) {
  const numericValue =
    typeof value === "string" && value.trim() ? Number(value) : value;

  if (
    !Number.isInteger(numericValue) ||
    numericValue < 1 ||
    numericValue > MAX_CART_ITEM_QUANTITY
  ) {
    throw new CartValidationError(
      `Quantity must be an integer between 1 and ${MAX_CART_ITEM_QUANTITY}.`,
    );
  }

  return numericValue;
}

export function parseCartItemId(value) {
  return parseId(value, "Cart item ID");
}

export function parseAddCartItemInput(body) {
  validatePlainObject(body);

  return {
    variantId: parseId(body.variantId, "Variant ID"),

    quantity: body.quantity === undefined ? 1 : parseQuantity(body.quantity),
  };
}

export function parseUpdateCartItemInput(body) {
  validatePlainObject(body);

  return {
    quantity: parseQuantity(body.quantity),
  };
}
