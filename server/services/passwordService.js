import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password) {
  if (typeof password !== "string" || password.trim().length === 0) {
    throw new TypeError("Password must be a non-empty string.");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, passwordHash) {
  if (typeof password !== "string" || typeof passwordHash !== "string") {
    throw new TypeError("Password and password hash must be strings.");
  }

  return bcrypt.compare(password, passwordHash);
}
