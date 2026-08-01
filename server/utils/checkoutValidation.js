const ID_MAX_LENGTH = 191;
const CUSTOMER_NOTE_MAX_LENGTH = 1000;

export class CheckoutValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "CheckoutValidationError";
    this.statusCode = 400;
  }
}

function validatePlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CheckoutValidationError("A valid request body is required.");
  }
}

function parseRequiredId(value, fieldName) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (!normalizedValue || normalizedValue.length > ID_MAX_LENGTH) {
    throw new CheckoutValidationError(`${fieldName} is invalid.`);
  }

  return normalizedValue;
}

function parseOptionalText(value, { fieldName, maximum }) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new CheckoutValidationError(`${fieldName} must be text.`);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.length > maximum) {
    throw new CheckoutValidationError(
      `${fieldName} must not exceed ${maximum} characters.`,
    );
  }

  return normalizedValue;
}

export function parsePlaceOrderInput(body) {
  validatePlainObject(body);

  return {
    addressId: parseRequiredId(body.addressId, "Delivery address"),

    customerNote: parseOptionalText(body.customerNote, {
      fieldName: "Customer note",
      maximum: CUSTOMER_NOTE_MAX_LENGTH,
    }),
  };
}
