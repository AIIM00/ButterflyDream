function validatePassword(password) {
  if (typeof password !== "string") {
    return "Password is required.";
  }

  if (password.length < 12) {
    return "Password must contain at least 12 characters.";
  }

  const passwordBytes = new TextEncoder().encode(password).length;

  if (passwordBytes > 72) {
    return "Password must not exceed 72 UTF-8 bytes.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain a lowercase letter.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain an uppercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain a number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain a special character.";
  }

  return null;
}

export default validatePassword;
