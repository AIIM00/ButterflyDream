const STORE_NAME_MAX_LENGTH = 120;
const MAX_DELIVERY_FEE = 1000000;

export class AdminStoreSettingValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "AdminStoreSettingValidationError";
    this.statusCode = 400;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

function parseStoreName(value) {
  if (typeof value !== "string") {
    throw new AdminStoreSettingValidationError("Store name must be text.");
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new AdminStoreSettingValidationError("Store name is required.");
  }

  if (normalizedValue.length > STORE_NAME_MAX_LENGTH) {
    throw new AdminStoreSettingValidationError(
      `Store name must not exceed ${STORE_NAME_MAX_LENGTH} characters.`,
    );
  }

  return normalizedValue;
}

function parseCurrency(value) {
  if (typeof value !== "string") {
    throw new AdminStoreSettingValidationError("Currency must be text.");
  }

  const normalizedValue = value.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(normalizedValue)) {
    throw new AdminStoreSettingValidationError(
      "Currency must be a valid three-letter code such as USD.",
    );
  }

  return normalizedValue;
}

function parseDeliveryFee(value) {
  const normalizedValue =
    typeof value === "number"
      ? String(value)
      : typeof value === "string"
        ? value.trim()
        : "";

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalizedValue)) {
    throw new AdminStoreSettingValidationError(
      "Delivery fee must be a positive amount with no more than two decimal places.",
    );
  }

  const numericValue = Number(normalizedValue);

  if (
    !Number.isFinite(numericValue) ||
    numericValue < 0 ||
    numericValue > MAX_DELIVERY_FEE
  ) {
    throw new AdminStoreSettingValidationError(
      `Delivery fee must be between 0 and ${MAX_DELIVERY_FEE}.`,
    );
  }

  return numericValue.toFixed(2);
}

function parseOrdersEnabled(value) {
  if (typeof value !== "boolean") {
    throw new AdminStoreSettingValidationError(
      "Orders enabled must be true or false.",
    );
  }

  return value;
}

export function parseAdminStoreSettingInput(body) {
  if (!isPlainObject(body)) {
    throw new AdminStoreSettingValidationError(
      "A valid request body is required.",
    );
  }

  const input = {};

  if (hasOwn(body, "storeName")) {
    input.storeName = parseStoreName(body.storeName);
  }

  if (hasOwn(body, "currency")) {
    input.currency = parseCurrency(body.currency);
  }

  if (hasOwn(body, "defaultDeliveryFee")) {
    input.defaultDeliveryFee = parseDeliveryFee(body.defaultDeliveryFee);
  }

  if (hasOwn(body, "ordersEnabled")) {
    input.ordersEnabled = parseOrdersEnabled(body.ordersEnabled);
  }

  if (Object.keys(input).length === 0) {
    throw new AdminStoreSettingValidationError(
      "At least one store setting must be provided.",
    );
  }

  return input;
}
