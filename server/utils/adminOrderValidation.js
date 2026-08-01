const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 50;
const MAX_PAGE = 100000;

const SEARCH_MAX_LENGTH = 200;
const NOTE_MAX_LENGTH = 2000;
const REASON_MAX_LENGTH = 1000;

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

const PAYMENT_STATUSES = new Set(["UNPAID", "PAID", "FAILED", "REFUNDED"]);

const SORT_OPTIONS = new Set(["newest", "oldest", "total_asc", "total_desc"]);

export class AdminOrderValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "AdminOrderValidationError";
    this.statusCode = 400;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePlainObject(value) {
  if (!isPlainObject(value)) {
    throw new AdminOrderValidationError("A valid request body is required.");
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
    throw new AdminOrderValidationError(
      `${fieldName} must be an integer between 1 and ${maximum}.`,
    );
  }

  return numericValue;
}

function parseOptionalText(value, { fieldName, maximum }) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new AdminOrderValidationError(`${fieldName} must be text.`);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.length > maximum) {
    throw new AdminOrderValidationError(
      `${fieldName} must not exceed ${maximum} characters.`,
    );
  }

  return normalizedValue;
}

function parseRequiredText(value, { fieldName, maximum }) {
  const normalizedValue = parseOptionalText(value, {
    fieldName,
    maximum,
  });

  if (!normalizedValue) {
    throw new AdminOrderValidationError(`${fieldName} is required.`);
  }

  return normalizedValue;
}

function parseEnum(value, { fieldName, allowedValues }) {
  const normalizedValue =
    typeof value === "string" ? value.trim().toUpperCase() : "";

  if (!normalizedValue || !allowedValues.has(normalizedValue)) {
    throw new AdminOrderValidationError(`${fieldName} is invalid.`);
  }

  return normalizedValue;
}

export function parseAdminOrderId(value) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (!normalizedValue) {
    throw new AdminOrderValidationError("Order ID is invalid.");
  }

  return normalizedValue;
}

export function parseAdminOrderQuery(query) {
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

  const search = typeof query.search === "string" ? query.search.trim() : "";

  if (search.length > SEARCH_MAX_LENGTH) {
    throw new AdminOrderValidationError(
      `Search must not exceed ${SEARCH_MAX_LENGTH} characters.`,
    );
  }

  const status =
    query.status === undefined || query.status === null || query.status === ""
      ? null
      : parseEnum(query.status, {
          fieldName: "Order status",
          allowedValues: ORDER_STATUSES,
        });

  const paymentStatus =
    query.paymentStatus === undefined ||
    query.paymentStatus === null ||
    query.paymentStatus === ""
      ? null
      : parseEnum(query.paymentStatus, {
          fieldName: "Payment status",
          allowedValues: PAYMENT_STATUSES,
        });

  const normalizedSort =
    typeof query.sort === "string" ? query.sort.trim().toLowerCase() : "newest";

  if (!SORT_OPTIONS.has(normalizedSort)) {
    throw new AdminOrderValidationError("Order sort is invalid.");
  }

  return {
    page,
    limit,
    search,
    status,
    paymentStatus,
    sort: normalizedSort,
  };
}

export function parseAdminOrderStatusInput(body) {
  validatePlainObject(body);

  const status = parseEnum(body.status, {
    fieldName: "Order status",
    allowedValues: ORDER_STATUSES,
  });

  if (status === "CANCELLED") {
    throw new AdminOrderValidationError(
      "Use the order cancellation endpoint to cancel an order.",
    );
  }

  return {
    status,

    note: parseOptionalText(body.note, {
      fieldName: "Status note",
      maximum: NOTE_MAX_LENGTH,
    }),
  };
}

export function parseAdminOrderCancelInput(body) {
  validatePlainObject(body);

  return {
    reason: parseRequiredText(body.reason, {
      fieldName: "Cancellation reason",
      maximum: REASON_MAX_LENGTH,
    }),
  };
}

export function parseAdminOrderNoteInput(body) {
  validatePlainObject(body);

  return {
    adminNote: parseOptionalText(body.adminNote, {
      fieldName: "Admin note",
      maximum: NOTE_MAX_LENGTH,
    }),
  };
}

export function parseAdminOrderPaymentInput(body) {
  validatePlainObject(body);

  return {
    paymentStatus: parseEnum(body.paymentStatus, {
      fieldName: "Payment status",
      allowedValues: PAYMENT_STATUSES,
    }),

    note: parseOptionalText(body.note, {
      fieldName: "Payment note",
      maximum: NOTE_MAX_LENGTH,
    }),
  };
}
