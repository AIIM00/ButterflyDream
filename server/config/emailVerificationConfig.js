import "dotenv/config";

function getRequiredEnvironmentVariable(variableName) {
  const value = process.env[variableName]?.trim();

  if (!value) {
    throw new Error(
      `${variableName} is required. Add it to the server .env file.`,
    );
  }

  return value;
}

function parseIntegerEnvironmentVariable(variableName, minimum, maximum) {
  const rawValue = getRequiredEnvironmentVariable(variableName);

  const parsedValue = Number(rawValue);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < minimum ||
    parsedValue > maximum
  ) {
    throw new Error(
      `${variableName} must be an integer between ${minimum} and ${maximum}.`,
    );
  }

  return parsedValue;
}

const emailVerificationConfig = Object.freeze({
  otpPurpose: "EMAIL_VERIFICATION",

  otpExpiresInMinutes: parseIntegerEnvironmentVariable(
    "EMAIL_VERIFICATION_OTP_MINUTES",
    1,
    30,
  ),

  maxAttempts: parseIntegerEnvironmentVariable(
    "EMAIL_VERIFICATION_OTP_MAX_ATTEMPTS",
    1,
    10,
  ),
});

export default emailVerificationConfig;
