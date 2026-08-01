import "dotenv/config";
import authConfig from "./authConfig.js";

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

const otpExpiresInMinutes = parseIntegerEnvironmentVariable(
  "PASSWORD_RESET_OTP_MINUTES",
  1,
  30,
);

const maxAttempts = parseIntegerEnvironmentVariable(
  "PASSWORD_RESET_OTP_MAX_ATTEMPTS",
  1,
  10,
);

const challengeCookiePath = "/api/auth/password-reset";

const passwordResetConfig = Object.freeze({
  otpPurpose: "PASSWORD_RESET",
  otpExpiresInMinutes,
  maxAttempts,

  challengeCookieName: `${authConfig.cookieName}_password_reset`,

  challengeTokenExpiresIn: `${otpExpiresInMinutes}m`,

  challengeIssuer: "accessories-platform-password-reset",

  challengeAudience: "accessories-platform-password-reset-client",

  challengeCookieOptions: Object.freeze({
    ...authConfig.cookieOptions,
    path: challengeCookiePath,
    maxAge: otpExpiresInMinutes * 60 * 1000,
  }),

  clearChallengeCookieOptions: Object.freeze({
    ...authConfig.clearCookieOptions,
    path: challengeCookiePath,
  }),
});

export default passwordResetConfig;
