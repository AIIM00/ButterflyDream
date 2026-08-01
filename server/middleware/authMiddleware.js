import jwt from "jsonwebtoken";
import authConfig from "../config/authConfig.js";
import prisma from "../src/prisma.js";
import { errorResponse } from "../utils/apiResponse.js";
import clearAuthCookie from "../utils/clearAuthCookie.js";
import sanitizeUser from "../utils/sanitizeUser.js";

const allowedRoles = new Set(["CUSTOMER", "ADMIN"]);

const allowedAuthenticationMethods = new Set([
  "PASSWORD",
  "PASSWORD_EMAIL_OTP",
]);

function rejectSession(response, statusCode, message) {
  clearAuthCookie(response);

  return errorResponse(response, statusCode, message);
}

function validateTokenPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }

  if (typeof payload.sub !== "string" || payload.sub.trim().length === 0) {
    return false;
  }

  if (!allowedRoles.has(payload.role)) {
    return false;
  }

  if (!allowedAuthenticationMethods.has(payload.authenticationMethod)) {
    return false;
  }

  if (!Number.isInteger(payload.iat) || !Number.isInteger(payload.exp)) {
    return false;
  }

  return true;
}

function isSessionOlderThanPassword(passwordChangedAt, tokenIssuedAt) {
  if (!passwordChangedAt) {
    return false;
  }

  const passwordChangedAtSeconds = Math.floor(
    passwordChangedAt.getTime() / 1000,
  );

  return passwordChangedAtSeconds > tokenIssuedAt;
}

async function requireAuthentication(request, response, next) {
  const token = request.cookies?.[authConfig.cookieName];

  if (typeof token !== "string" || token.trim().length === 0) {
    return errorResponse(response, 401, "Authentication is required.");
  }

  let payload;

  try {
    payload = jwt.verify(token, authConfig.jwtSecret, {
      algorithms: [authConfig.jwtAlgorithm],
      issuer: authConfig.jwtIssuer,
      audience: authConfig.jwtAudience,
    });
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return rejectSession(
        response,
        401,
        "Your session has expired. Please log in again.",
      );
    }

    if (error?.name === "JsonWebTokenError") {
      return rejectSession(
        response,
        401,
        "Your authentication session is invalid.",
      );
    }

    return next(error);
  }

  if (!validateTokenPayload(payload)) {
    return rejectSession(
      response,
      401,
      "Your authentication session is invalid.",
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        passwordChangedAt: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || user.deletedAt !== null) {
      return rejectSession(
        response,
        401,
        "This authentication session is no longer valid.",
      );
    }

    if (user.status !== "ACTIVE") {
      return rejectSession(
        response,
        403,
        "This account is currently unavailable.",
      );
    }

    if (user.role !== payload.role) {
      return rejectSession(
        response,
        401,
        "Your account permissions have changed. Please log in again.",
      );
    }

    if (
      user.role === "ADMIN" &&
      payload.authenticationMethod !== "PASSWORD_EMAIL_OTP"
    ) {
      return rejectSession(
        response,
        401,
        "Admin authentication requires email OTP verification.",
      );
    }

    if (
      user.role === "CUSTOMER" &&
      payload.authenticationMethod !== "PASSWORD"
    ) {
      return rejectSession(
        response,
        401,
        "Your authentication session is invalid.",
      );
    }

    if (isSessionOlderThanPassword(user.passwordChangedAt, payload.iat)) {
      return rejectSession(
        response,
        401,
        "Your password has changed. Please log in again.",
      );
    }

    request.user = sanitizeUser(user);

    request.auth = {
      authenticationMethod: payload.authenticationMethod,

      issuedAt: new Date(payload.iat * 1000),

      expiresAt: new Date(payload.exp * 1000),
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

export default requireAuthentication;
