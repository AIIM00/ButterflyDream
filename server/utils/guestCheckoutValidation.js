const MAX_ITEMS = 50;
const MAX_QUANTITY = 99;
const CUSTOMER_NOTE_MAX_LENGTH = 1000;

const FIELD_LIMITS = {
  fullName: 120,
  email: 255,
  phone: 30,
  recipientName: 120,
  governorate: 100,
  city: 120,
  street: 255,
  building: 120,
  floor: 50,
  landmark: 255,
  notes: 1000,
};

export class GuestCheckoutValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "GuestCheckoutValidationError";
    this.statusCode = statusCode;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireObject(value, label) {
  if (!isPlainObject(value)) {
    throw new GuestCheckoutValidationError(`${label} is required.`);
  }

  return value;
}

function requiredText(value, fieldName, maximum) {
  if (typeof value !== "string") {
    throw new GuestCheckoutValidationError(`${fieldName} is required.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new GuestCheckoutValidationError(`${fieldName} is required.`);
  }

  if (normalized.length > maximum) {
    throw new GuestCheckoutValidationError(
      `${fieldName} must not exceed ${maximum} characters.`,
    );
  }

  return normalized;
}

function optionalText(value, fieldName, maximum) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new GuestCheckoutValidationError(`${fieldName} must be text.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > maximum) {
    throw new GuestCheckoutValidationError(
      `${fieldName} must not exceed ${maximum} characters.`,
    );
  }

  return normalized;
}

function parseEmail(value) {
  const email = requiredText(value, "Email address", FIELD_LIMITS.email).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new GuestCheckoutValidationError("Please provide a valid email address.");
  }

  return email;
}

export function parseCheckoutItems(value) {
  if (!Array.isArray(value)) {
    throw new GuestCheckoutValidationError("Checkout items are required.");
  }

  if (value.length > MAX_ITEMS) {
    throw new GuestCheckoutValidationError(
      `Checkout may contain no more than ${MAX_ITEMS} distinct items.`,
    );
  }

  const quantities = new Map();

  for (const rawItem of value) {
    if (!isPlainObject(rawItem)) {
      throw new GuestCheckoutValidationError("Each checkout item must be valid.");
    }

    const variantId = requiredText(rawItem.variantId, "Variant ID", 191);
    const quantity = Number(rawItem.quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new GuestCheckoutValidationError(
        `Item quantity must be an integer between 1 and ${MAX_QUANTITY}.`,
      );
    }

    const combinedQuantity = (quantities.get(variantId) ?? 0) + quantity;

    if (combinedQuantity > MAX_QUANTITY) {
      throw new GuestCheckoutValidationError(
        `Item quantity must not exceed ${MAX_QUANTITY}.`,
      );
    }

    quantities.set(variantId, combinedQuantity);
  }

  return [...quantities.entries()].map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));
}

export function parseManualAddress(value, { required = true } = {}) {
  if ((value === undefined || value === null) && !required) {
    return null;
  }

  const address = requireObject(value, "Delivery address");

  return {
    recipientName: requiredText(
      address.recipientName,
      "Recipient name",
      FIELD_LIMITS.recipientName,
    ),
    phone: requiredText(address.phone, "Phone number", FIELD_LIMITS.phone),
    governorate: requiredText(
      address.governorate,
      "Governorate",
      FIELD_LIMITS.governorate,
    ),
    city: requiredText(address.city, "City", FIELD_LIMITS.city),
    street: requiredText(address.street, "Street", FIELD_LIMITS.street),
    building: optionalText(address.building, "Building", FIELD_LIMITS.building),
    floor: optionalText(address.floor, "Floor", FIELD_LIMITS.floor),
    landmark: optionalText(address.landmark, "Landmark", FIELD_LIMITS.landmark),
    notes: optionalText(address.notes, "Address notes", FIELD_LIMITS.notes),
  };
}

export function parseCheckoutPreviewInput(body) {
  requireObject(body, "Request body");

  return {
    items: parseCheckoutItems(body.items ?? []),
    deliveryAddress: parseManualAddress(body.deliveryAddress, {
      required: false,
    }),
  };
}

export function parseGuestOrderInput(body) {
  requireObject(body, "Request body");

  const customer = requireObject(body.customer, "Customer information");

  return {
    items: parseCheckoutItems(body.items),
    customer: {
      fullName: requiredText(
        customer.fullName,
        "Full name",
        FIELD_LIMITS.fullName,
      ),
      email: parseEmail(customer.email),
      phone: requiredText(customer.phone, "Phone number", FIELD_LIMITS.phone),
    },
    deliveryAddress: parseManualAddress(body.deliveryAddress),
    customerNote: optionalText(
      body.customerNote,
      "Customer note",
      CUSTOMER_NOTE_MAX_LENGTH,
    ),
  };
}

export function parseCustomerManualOrderInput(body) {
  requireObject(body, "Request body");

  return {
    deliveryAddress: parseManualAddress(body.deliveryAddress),
    customerNote: optionalText(
      body.customerNote,
      "Customer note",
      CUSTOMER_NOTE_MAX_LENGTH,
    ),
  };
}
