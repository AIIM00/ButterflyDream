const CUSTOMER_STATUSES = new Set(["ACTIVE", "SUSPENDED"]);
const CUSTOMER_SORTS = new Set(["newest", "oldest", "name_asc", "name_desc"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class AdminCustomerValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AdminCustomerValidationError";
    this.statusCode = statusCode;
  }
}

function parsePositiveInteger(value, fallback, fieldName, maximum) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new AdminCustomerValidationError(
      `${fieldName} must be an integer between 1 and ${maximum}.`,
    );
  }

  return parsed;
}

export function parseAdminCustomerId(value) {
  const customerId = String(value ?? "").trim();

  if (!UUID_PATTERN.test(customerId)) {
    throw new AdminCustomerValidationError("customerId must be a valid UUID.");
  }

  return customerId;
}

export function parseAdminCustomerQuery(query = {}) {
  const page = parsePositiveInteger(query.page, 1, "page", 100000);
  const limit = parsePositiveInteger(query.limit, 15, "limit", 100);

  const search = String(query.search ?? "").trim();

  if (search.length > 120) {
    throw new AdminCustomerValidationError(
      "search must be 120 characters or fewer.",
    );
  }

  const status = String(query.status ?? "").trim().toUpperCase();

  if (status && !CUSTOMER_STATUSES.has(status)) {
    throw new AdminCustomerValidationError(
      "status must be ACTIVE or SUSPENDED.",
    );
  }

  const sort = String(query.sort ?? "newest").trim().toLowerCase();

  if (!CUSTOMER_SORTS.has(sort)) {
    throw new AdminCustomerValidationError(
      "sort must be newest, oldest, name_asc, or name_desc.",
    );
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    search: search || undefined,
    status: status || undefined,
    sort,
  };
}
