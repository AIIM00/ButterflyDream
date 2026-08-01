import jwt from "jsonwebtoken";
import authConfig from "../config/authConfig.js";

const allowedRoles = new Set(["CUSTOMER", "ADMIN"]);

const allowedAuthenticationMethods = new Set([
  "PASSWORD",
  "PASSWORD_EMAIL_OTP",
]);

function generateAuthToken(user, { authenticationMethod = "PASSWORD" } = {}) {
  if (!user || typeof user !== "object" || Array.isArray(user)) {
    throw new TypeError("generateAuthToken requires a valid user object.");
  }

  if (typeof user.id !== "string" || user.id.trim().length === 0) {
    throw new TypeError("The user must contain a valid string ID.");
  }

  if (!allowedRoles.has(user.role)) {
    throw new TypeError("The user must have a CUSTOMER or ADMIN role.");
  }

  if (!allowedAuthenticationMethods.has(authenticationMethod)) {
    throw new TypeError("The authentication method is invalid.");
  }

  if (user.role === "CUSTOMER" && authenticationMethod !== "PASSWORD") {
    throw new Error("Customer sessions must use password authentication.");
  }

  if (user.role === "ADMIN" && authenticationMethod !== "PASSWORD_EMAIL_OTP") {
    throw new Error(
      "Admin sessions require password and email OTP authentication.",
    );
  }

  return jwt.sign(
    {
      role: user.role,
      authenticationMethod,
    },
    authConfig.jwtSecret,
    {
      algorithm: authConfig.jwtAlgorithm,
      subject: user.id,
      expiresIn: authConfig.jwtExpiresIn,
      issuer: authConfig.jwtIssuer,
      audience: authConfig.jwtAudience,
    },
  );
}

export default generateAuthToken;
