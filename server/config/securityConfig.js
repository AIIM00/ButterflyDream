import "dotenv/config";

function parsePositiveInteger(
  variableName,
  defaultValue,
  minimum = 1,
  maximum = 100000,
) {
  const rawValue = process.env[variableName]?.trim();

  if (!rawValue) {
    return defaultValue;
  }

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

function parseTrustProxy(value) {
  if (!value || value === "false") {
    return false;
  }

  if (value === "true") {
    return 1;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new Error(
      "TRUST_PROXY must be false, true, or a non-negative integer.",
    );
  }

  return parsedValue;
}

function validateOrigin(origin, isProduction) {
  if (origin === "*") {
    throw new Error(
      "ALLOWED_FRONTEND_ORIGINS must not contain * when cookie authentication is enabled.",
    );
  }

  let parsedOrigin;

  try {
    parsedOrigin = new URL(origin);
  } catch {
    throw new Error(
      `ALLOWED_FRONTEND_ORIGINS contains an invalid origin: ${origin}`,
    );
  }

  if (!["http:", "https:"].includes(parsedOrigin.protocol)) {
    throw new Error(
      `ALLOWED_FRONTEND_ORIGINS contains an unsupported protocol: ${origin}`,
    );
  }

  if (parsedOrigin.origin !== origin) {
    throw new Error(
      `ALLOWED_FRONTEND_ORIGINS must contain origins only, without paths, query strings, or fragments: ${origin}`,
    );
  }

  if (isProduction && parsedOrigin.protocol !== "https:") {
    throw new Error(`Production frontend origins must use HTTPS: ${origin}`);
  }

  return parsedOrigin.origin;
}

function getAllowedOrigins(isProduction) {
  const rawOrigins = process.env.ALLOWED_FRONTEND_ORIGINS?.trim();

  if (!rawOrigins) {
    if (isProduction) {
      throw new Error("ALLOWED_FRONTEND_ORIGINS is required in production.");
    }

    return ["http://localhost:5173"];
  }

  const configuredOrigins = rawOrigins
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean)
    .map((origin) => validateOrigin(origin, isProduction));

  if (configuredOrigins.length === 0) {
    throw new Error(
      "ALLOWED_FRONTEND_ORIGINS must contain at least one valid origin.",
    );
  }

  return [...new Set(configuredOrigins)];
}
const isProduction = process.env.NODE_ENV?.trim() === "production";

const securityConfig = Object.freeze({
  isProduction,

  trustProxy: parseTrustProxy(process.env.TRUST_PROXY?.trim()),

  allowedOrigins: getAllowedOrigins(isProduction),

  requestBodyLimit: process.env.REQUEST_BODY_LIMIT?.trim() || "250kb",

  apiRateLimit: {
    windowMinutes: parsePositiveInteger(
      "API_RATE_LIMIT_WINDOW_MINUTES",
      15,
      1,
      1440,
    ),

    maxRequests: parsePositiveInteger(
      "API_RATE_LIMIT_MAX_REQUESTS",
      500,
      10,
      100000,
    ),
  },

  authRateLimit: {
    windowMinutes: parsePositiveInteger(
      "AUTH_RATE_LIMIT_WINDOW_MINUTES",
      15,
      1,
      1440,
    ),

    maxRequests: parsePositiveInteger(
      "AUTH_RATE_LIMIT_MAX_REQUESTS",
      30,
      1,
      1000,
    ),
  },

  checkoutRateLimit: {
    windowMinutes: parsePositiveInteger(
      "CHECKOUT_RATE_LIMIT_WINDOW_MINUTES",
      10,
      1,
      1440,
    ),

    maxRequests: parsePositiveInteger(
      "CHECKOUT_RATE_LIMIT_MAX_REQUESTS",
      20,
      1,
      1000,
    ),
  },

  adminRateLimit: {
    windowMinutes: parsePositiveInteger(
      "ADMIN_RATE_LIMIT_WINDOW_MINUTES",
      15,
      1,
      1440,
    ),

    maxRequests: parsePositiveInteger(
      "ADMIN_RATE_LIMIT_MAX_REQUESTS",
      300,
      1,
      10000,
    ),
  },
});

export default securityConfig;
