const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_PAGE = 100000;

const NOTIFICATION_STATUSES = new Set(["all", "unread", "read"]);

const NOTIFICATION_TYPES = new Set([
  "ORDER_PLACED",
  "ORDER_CONFIRMED",
  "ORDER_STATUS_CHANGED",
  "ORDER_CANCELLED",
  "ORDER_DELIVERED",
  "SYSTEM",
]);

export class CustomerNotificationValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "CustomerNotificationValidationError";
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
    throw new CustomerNotificationValidationError(
      `${fieldName} must be an integer between 1 and ${maximum}.`,
    );
  }

  return numericValue;
}

export function parseCustomerNotificationId(value) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (!normalizedValue) {
    throw new CustomerNotificationValidationError(
      "Notification ID is invalid.",
    );
  }

  return normalizedValue;
}

export function parseCustomerNotificationQuery(query) {
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

  const status =
    typeof query.status === "string"
      ? query.status.trim().toLowerCase()
      : "all";

  if (!NOTIFICATION_STATUSES.has(status)) {
    throw new CustomerNotificationValidationError(
      "Notification status must be all, unread, or read.",
    );
  }

  const type =
    typeof query.type === "string" ? query.type.trim().toUpperCase() : "";

  if (type && !NOTIFICATION_TYPES.has(type)) {
    throw new CustomerNotificationValidationError(
      "Notification type is invalid.",
    );
  }

  return {
    page,
    limit,
    status,
    type: type || null,
  };
}
