const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_BYTES = 72;

export class AdminPasswordValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "AdminPasswordValidationError";
    this.statusCode = 400;
  }
}

function validateNewPassword(password) {
  if (typeof password !== "string") {
    throw new AdminPasswordValidationError("A new password is required.");
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new AdminPasswordValidationError(
      "The new password must contain at least 12 characters.",
    );
  }

  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
    throw new AdminPasswordValidationError(
      "The new password must not exceed 72 UTF-8 bytes.",
    );
  }

  if (!/[a-z]/.test(password)) {
    throw new AdminPasswordValidationError(
      "The new password must contain a lowercase letter.",
    );
  }

  if (!/[A-Z]/.test(password)) {
    throw new AdminPasswordValidationError(
      "The new password must contain an uppercase letter.",
    );
  }

  if (!/[0-9]/.test(password)) {
    throw new AdminPasswordValidationError(
      "The new password must contain a number.",
    );
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new AdminPasswordValidationError(
      "The new password must contain a special character.",
    );
  }

  return password;
}

export function parseInitialAdminPasswordInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AdminPasswordValidationError("A valid request body is required.");
  }

  const newPassword = validateNewPassword(body.newPassword);

  if (typeof body.confirmPassword !== "string") {
    throw new AdminPasswordValidationError(
      "Password confirmation is required.",
    );
  }

  if (newPassword !== body.confirmPassword) {
    throw new AdminPasswordValidationError("The passwords do not match.");
  }

  return {
    newPassword,
  };
}
