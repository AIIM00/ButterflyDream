const FULL_NAME_MIN_LENGTH = 2;
const FULL_NAME_MAX_LENGTH = 100;
const PHONE_MAX_LENGTH = 30;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

export class CustomerProfileValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "CustomerProfileValidationError";
    this.statusCode = 400;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateBody(body) {
  if (!isPlainObject(body)) {
    throw new CustomerProfileValidationError(
      "A valid request body is required.",
    );
  }
}

function parseFullName(value) {
  if (typeof value !== "string") {
    throw new CustomerProfileValidationError("Full name must be text.");
  }

  const normalizedValue = value.trim().replace(/\s+/g, " ");

  if (normalizedValue.length < FULL_NAME_MIN_LENGTH) {
    throw new CustomerProfileValidationError(
      `Full name must contain at least ${FULL_NAME_MIN_LENGTH} characters.`,
    );
  }

  if (normalizedValue.length > FULL_NAME_MAX_LENGTH) {
    throw new CustomerProfileValidationError(
      `Full name must not exceed ${FULL_NAME_MAX_LENGTH} characters.`,
    );
  }

  return normalizedValue;
}

function parsePhone(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new CustomerProfileValidationError("Phone number must be text.");
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.length > PHONE_MAX_LENGTH) {
    throw new CustomerProfileValidationError(
      `Phone number must not exceed ${PHONE_MAX_LENGTH} characters.`,
    );
  }

  if (!/^[+\d][\d\s().-]*$/.test(normalizedValue)) {
    throw new CustomerProfileValidationError(
      "Phone number contains invalid characters.",
    );
  }

  const digitCount = normalizedValue.replace(/\D/g, "").length;

  if (digitCount < 7 || digitCount > 15) {
    throw new CustomerProfileValidationError(
      "Phone number must contain between 7 and 15 digits.",
    );
  }

  return normalizedValue;
}

function parsePassword(value, fieldName) {
  if (typeof value !== "string") {
    throw new CustomerProfileValidationError(`${fieldName} is required.`);
  }

  if (value.length < PASSWORD_MIN_LENGTH) {
    throw new CustomerProfileValidationError(
      `${fieldName} must contain at least ${PASSWORD_MIN_LENGTH} characters.`,
    );
  }

  if (value.length > PASSWORD_MAX_LENGTH) {
    throw new CustomerProfileValidationError(
      `${fieldName} must not exceed ${PASSWORD_MAX_LENGTH} characters.`,
    );
  }

  return value;
}

function validatePasswordStrength(password) {
  if (!/[a-z]/.test(password)) {
    throw new CustomerProfileValidationError(
      "New password must contain a lowercase letter.",
    );
  }

  if (!/[A-Z]/.test(password)) {
    throw new CustomerProfileValidationError(
      "New password must contain an uppercase letter.",
    );
  }

  if (!/\d/.test(password)) {
    throw new CustomerProfileValidationError(
      "New password must contain a number.",
    );
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new CustomerProfileValidationError(
      "New password must contain a special character.",
    );
  }
}

export function parseCustomerProfileInput(body) {
  validateBody(body);

  return {
    fullName: parseFullName(body.fullName),

    phone: parsePhone(body.phone),
  };
}

export function parseCustomerPasswordInput(body) {
  validateBody(body);

  const currentPassword = parsePassword(
    body.currentPassword,
    "Current password",
  );

  const newPassword = parsePassword(body.newPassword, "New password");

  const confirmPassword = parsePassword(
    body.confirmPassword,
    "Password confirmation",
  );

  if (newPassword !== confirmPassword) {
    throw new CustomerProfileValidationError(
      "New password and password confirmation do not match.",
    );
  }

  if (currentPassword === newPassword) {
    throw new CustomerProfileValidationError(
      "New password must be different from the current password.",
    );
  }

  validatePasswordStrength(newPassword);

  return {
    currentPassword,
    newPassword,
  };
}
