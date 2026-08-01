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

function getAllowedOrigins() {
  const configuredOrigins = (
    process.env.ALLOWED_FRONTEND_ORIGINS ??
    process.env.FRONTEND_ORIGIN ??
    process.env.CLIENT_ORIGIN ??
    process.env.FRONTEND_URL ??
    "http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return [...new Set(configuredOrigins)];
}

const securityConfig = Object.freeze({
  isProduction: process.env.NODE_ENV === "production",

  trustProxy: parseTrustProxy(process.env.TRUST_PROXY?.trim()),

  allowedOrigins: getAllowedOrigins(),

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
