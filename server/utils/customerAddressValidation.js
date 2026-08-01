const ADDRESS_LIMIT = 10;

const FIELD_LIMITS = {
  label: 50,
  recipientName: 120,
  phone: 30,
  governorate: 100,
  city: 120,
  street: 255,
  building: 120,
  floor: 50,
  landmark: 255,
  notes: 1000,
};

export class CustomerAddressValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "CustomerAddressValidationError";
    this.statusCode = 400;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePlainObject(value) {
  if (!isPlainObject(value)) {
    throw new CustomerAddressValidationError(
      "A valid request body is required.",
    );
  }
}

function hasOwn(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

function parseRequiredText(value, { fieldName, maximum }) {
  if (typeof value !== "string") {
    throw new CustomerAddressValidationError(`${fieldName} is required.`);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new CustomerAddressValidationError(`${fieldName} is required.`);
  }

  if (normalizedValue.length > maximum) {
    throw new CustomerAddressValidationError(
      `${fieldName} must not exceed ${maximum} characters.`,
    );
  }

  return normalizedValue;
}

function parseOptionalText(value, { fieldName, maximum }) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new CustomerAddressValidationError(`${fieldName} must be text.`);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.length > maximum) {
    throw new CustomerAddressValidationError(
      `${fieldName} must not exceed ${maximum} characters.`,
    );
  }

  return normalizedValue;
}

function parseBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw new CustomerAddressValidationError(
      `${fieldName} must be true or false.`,
    );
  }

  return value;
}

export function parseCustomerAddressId(value) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (!normalizedValue) {
    throw new CustomerAddressValidationError("Address ID is invalid.");
  }

  return normalizedValue;
}

export function parseCreateCustomerAddressInput(body) {
  validatePlainObject(body);

  return {
    label: parseRequiredText(body.label, {
      fieldName: "Address label",
      maximum: FIELD_LIMITS.label,
    }),

    recipientName: parseRequiredText(body.recipientName, {
      fieldName: "Recipient name",
      maximum: FIELD_LIMITS.recipientName,
    }),

    phone: parseRequiredText(body.phone, {
      fieldName: "Phone number",
      maximum: FIELD_LIMITS.phone,
    }),

    governorate: parseRequiredText(body.governorate, {
      fieldName: "Governorate",
      maximum: FIELD_LIMITS.governorate,
    }),

    city: parseRequiredText(body.city, {
      fieldName: "City",
      maximum: FIELD_LIMITS.city,
    }),

    street: parseRequiredText(body.street, {
      fieldName: "Street",
      maximum: FIELD_LIMITS.street,
    }),

    building: parseOptionalText(body.building, {
      fieldName: "Building",
      maximum: FIELD_LIMITS.building,
    }),

    floor: parseOptionalText(body.floor, {
      fieldName: "Floor",
      maximum: FIELD_LIMITS.floor,
    }),

    landmark: parseOptionalText(body.landmark, {
      fieldName: "Landmark",
      maximum: FIELD_LIMITS.landmark,
    }),

    notes: parseOptionalText(body.notes, {
      fieldName: "Address notes",
      maximum: FIELD_LIMITS.notes,
    }),

    isDefault:
      body.isDefault === undefined
        ? false
        : parseBoolean(body.isDefault, "Default address"),
  };
}

export function parseUpdateCustomerAddressInput(body) {
  validatePlainObject(body);

  const data = {};

  if (hasOwn(body, "label")) {
    data.label = parseRequiredText(body.label, {
      fieldName: "Address label",
      maximum: FIELD_LIMITS.label,
    });
  }

  if (hasOwn(body, "recipientName")) {
    data.recipientName = parseRequiredText(body.recipientName, {
      fieldName: "Recipient name",
      maximum: FIELD_LIMITS.recipientName,
    });
  }

  if (hasOwn(body, "phone")) {
    data.phone = parseRequiredText(body.phone, {
      fieldName: "Phone number",
      maximum: FIELD_LIMITS.phone,
    });
  }

  if (hasOwn(body, "governorate")) {
    data.governorate = parseRequiredText(body.governorate, {
      fieldName: "Governorate",
      maximum: FIELD_LIMITS.governorate,
    });
  }

  if (hasOwn(body, "city")) {
    data.city = parseRequiredText(body.city, {
      fieldName: "City",
      maximum: FIELD_LIMITS.city,
    });
  }

  if (hasOwn(body, "street")) {
    data.street = parseRequiredText(body.street, {
      fieldName: "Street",
      maximum: FIELD_LIMITS.street,
    });
  }

  if (hasOwn(body, "building")) {
    data.building = parseOptionalText(body.building, {
      fieldName: "Building",
      maximum: FIELD_LIMITS.building,
    });
  }

  if (hasOwn(body, "floor")) {
    data.floor = parseOptionalText(body.floor, {
      fieldName: "Floor",
      maximum: FIELD_LIMITS.floor,
    });
  }

  if (hasOwn(body, "landmark")) {
    data.landmark = parseOptionalText(body.landmark, {
      fieldName: "Landmark",
      maximum: FIELD_LIMITS.landmark,
    });
  }

  if (hasOwn(body, "notes")) {
    data.notes = parseOptionalText(body.notes, {
      fieldName: "Address notes",
      maximum: FIELD_LIMITS.notes,
    });
  }

  if (Object.keys(data).length === 0) {
    throw new CustomerAddressValidationError(
      "At least one address field must be provided.",
    );
  }

  return data;
}

export const MAX_CUSTOMER_ADDRESSES = ADDRESS_LIMIT;
