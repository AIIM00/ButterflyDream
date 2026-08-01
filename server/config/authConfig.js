import "dotenv/config";

const allowedSameSiteValues = new Set(["lax", "strict", "none"]);

function getRequiredEnvironmentVariable(variableName) {
  const value = process.env[variableName]?.trim();

  if (!value) {
    throw new Error(
      `${variableName} is required. Add it to the server .env file.`,
    );
  }

  return value;
}

function parseSessionDays(rawSessionDays) {
  const sessionDays = Number(rawSessionDays);

  if (!Number.isInteger(sessionDays) || sessionDays < 1 || sessionDays > 30) {
    throw new Error("AUTH_SESSION_DAYS must be an integer between 1 and 30.");
  }

  return sessionDays;
}

function validateJwtSecret(jwtSecret) {
  if (jwtSecret.length < 64) {
    throw new Error("JWT_SECRET must contain at least 64 characters.");
  }

  const unsafeSecrets = new Set([
    "REPLACE_WITH_A_LONG_RANDOM_SECRET",
    "YOUR_LONG_RANDOM_SECRET",
    "secret",
    "secret123",
  ]);

  if (unsafeSecrets.has(jwtSecret)) {
    throw new Error("JWT_SECRET still contains an unsafe example value.");
  }
}

function validateCookieName(cookieName) {
  const validCookieNamePattern = /^[A-Za-z0-9._-]+$/;

  if (!validCookieNamePattern.test(cookieName)) {
    throw new Error(
      "AUTH_COOKIE_NAME may contain only letters, numbers, dots, underscores, and hyphens.",
    );
  }
}

function parseSameSite(rawSameSite, isProduction) {
  const sameSite = rawSameSite.toLowerCase();

  if (!allowedSameSiteValues.has(sameSite)) {
    throw new Error("AUTH_COOKIE_SAME_SITE must be lax, strict, or none.");
  }

  if (sameSite === "none" && !isProduction) {
    throw new Error(
      "AUTH_COOKIE_SAME_SITE cannot be none during the current non-HTTPS development setup.",
    );
  }

  return sameSite;
}

const nodeEnvironment = process.env.NODE_ENV?.trim() || "development";

const isProduction = nodeEnvironment === "production";

const jwtSecret = getRequiredEnvironmentVariable("JWT_SECRET");

const sessionDays = parseSessionDays(
  getRequiredEnvironmentVariable("AUTH_SESSION_DAYS"),
);

const cookieName = getRequiredEnvironmentVariable("AUTH_COOKIE_NAME");

const cookieSameSite = parseSameSite(
  getRequiredEnvironmentVariable("AUTH_COOKIE_SAME_SITE"),
  isProduction,
);

validateJwtSecret(jwtSecret);
validateCookieName(cookieName);

const cookieBaseOptions = Object.freeze({
  httpOnly: true,
  secure: isProduction,
  sameSite: cookieSameSite,
  path: "/",
});

const authConfig = Object.freeze({
  jwtSecret,
  jwtAlgorithm: "HS256",
  jwtIssuer: "accessories-platform-api",
  jwtAudience: "accessories-platform-client",
  jwtExpiresIn: `${sessionDays}d`,

  sessionDays,
  cookieName,

  cookieOptions: Object.freeze({
    ...cookieBaseOptions,
    maxAge: sessionDays * 24 * 60 * 60 * 1000,
  }),

  clearCookieOptions: cookieBaseOptions,
});

export default authConfig;
