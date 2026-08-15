const MAX_DELIVERY_FEE = 1000000;

export class AdminDeliveryGovernorateValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "AdminDeliveryGovernorateValidationError";
    this.statusCode = 400;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

function parseDeliveryFee(value) {
  const normalizedValue =
    typeof value === "number"
      ? String(value)
      : typeof value === "string"
        ? value.trim()
        : "";

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalizedValue)) {
    throw new AdminDeliveryGovernorateValidationError(
      "Delivery fee must be a positive amount with no more than two decimal places.",
    );
  }

  const numericValue = Number(normalizedValue);

  if (
    !Number.isFinite(numericValue) ||
    numericValue < 0 ||
    numericValue > MAX_DELIVERY_FEE
  ) {
    throw new AdminDeliveryGovernorateValidationError(
      `Delivery fee must be between 0 and ${MAX_DELIVERY_FEE}.`,
    );
  }

  return numericValue.toFixed(2);
}

function parseIsActive(value) {
  if (typeof value !== "boolean") {
    throw new AdminDeliveryGovernorateValidationError(
      "Active status must be true or false.",
    );
  }

  return value;
}

export function parseAdminDeliveryGovernorateId(value) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (!normalizedValue) {
    throw new AdminDeliveryGovernorateValidationError(
      "Delivery governorate ID is invalid.",
    );
  }

  return normalizedValue;
}

export function parseAdminDeliveryGovernorateUpdateInput(body) {
  if (!isPlainObject(body)) {
    throw new AdminDeliveryGovernorateValidationError(
      "A valid request body is required.",
    );
  }

  const input = {};

  if (hasOwn(body, "deliveryFee")) {
    input.deliveryFee = parseDeliveryFee(body.deliveryFee);
  }

  if (hasOwn(body, "isActive")) {
    input.isActive = parseIsActive(body.isActive);
  }

  if (Object.keys(input).length === 0) {
    throw new AdminDeliveryGovernorateValidationError(
      "At least one delivery setting must be provided.",
    );
  }

  return input;
}
