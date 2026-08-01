const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const MAX_PAGE = 100000;

const ORDER_STATUSES = new Set([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
]);

const ORDER_SORT_OPTIONS = new Set(["newest", "oldest"]);

export class CustomerOrderValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "CustomerOrderValidationError";
    this.statusCode = 400;
  }
}

function parsePositiveInteger(value, { fieldName, defaultValue, maximum }) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const numericValue = Number(value);

  if (
    !Number.isInteger(numericValue) ||
    numericValue < 1 ||
    numericValue > maximum
  ) {
    throw new CustomerOrderValidationError(
      `${fieldName} must be an integer between 1 and ${maximum}.`,
    );
  }

  return numericValue;
}

export function parseCustomerOrderId(value) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (!normalizedValue) {
    throw new CustomerOrderValidationError("Order ID is invalid.");
  }

  return normalizedValue;
}

export function parseCustomerOrderQuery(query) {
  const page = parsePositiveInteger(query.page, {
    fieldName: "Page",
    defaultValue: DEFAULT_PAGE,
    maximum: MAX_PAGE,
  });

  const limit = parsePositiveInteger(query.limit, {
    fieldName: "Limit",
    defaultValue: DEFAULT_LIMIT,
    maximum: MAX_LIMIT,
  });

  const normalizedStatus =
    typeof query.status === "string" ? query.status.trim().toUpperCase() : "";

  if (normalizedStatus && !ORDER_STATUSES.has(normalizedStatus)) {
    throw new CustomerOrderValidationError("Order status is invalid.");
  }

  const normalizedSort =
    typeof query.sort === "string" ? query.sort.trim().toLowerCase() : "newest";

  if (!ORDER_SORT_OPTIONS.has(normalizedSort)) {
    throw new CustomerOrderValidationError(
      "Order sort must be newest or oldest.",
    );
  }

  return {
    page,
    limit,
    status: normalizedStatus || null,
    sort: normalizedSort,
  };
}
