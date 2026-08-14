import { randomUUID } from "node:crypto";

import jwt from "jsonwebtoken";

import authConfig from "../config/authConfig.js";

const SITE_PREVIEW_TOKEN_TYPE = "SITE_DRAFT_PREVIEW";

const SITE_PREVIEW_ISSUER = `${authConfig.jwtIssuer}:site-preview`;

const SITE_PREVIEW_AUDIENCE = "butterfly-dream-site-preview";

const SITE_PREVIEW_EXPIRES_IN_SECONDS = 5 * 60;

export function createSitePreviewToken({ adminUserId }) {
  if (typeof adminUserId !== "string" || adminUserId.trim().length === 0) {
    throw new TypeError("A valid admin user ID is required.");
  }

  const token = jwt.sign(
    {
      type: SITE_PREVIEW_TOKEN_TYPE,
    },

    authConfig.jwtSecret,

    {
      algorithm: authConfig.jwtAlgorithm,

      subject: adminUserId,

      jwtid: randomUUID(),

      expiresIn: SITE_PREVIEW_EXPIRES_IN_SECONDS,

      issuer: SITE_PREVIEW_ISSUER,

      audience: SITE_PREVIEW_AUDIENCE,
    },
  );

  return {
    token,

    expiresAt: new Date(
      Date.now() + SITE_PREVIEW_EXPIRES_IN_SECONDS * 1000,
    ).toISOString(),
  };
}

export function verifySitePreviewToken(token) {
  const payload = jwt.verify(token, authConfig.jwtSecret, {
    algorithms: [authConfig.jwtAlgorithm],

    issuer: SITE_PREVIEW_ISSUER,

    audience: SITE_PREVIEW_AUDIENCE,
  });

  const isValid =
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    payload.type === SITE_PREVIEW_TOKEN_TYPE &&
    typeof payload.sub === "string" &&
    payload.sub.length > 0;

  if (!isValid) {
    throw new jwt.JsonWebTokenError("Invalid website preview token.");
  }

  return {
    adminUserId: payload.sub,

    expiresAt: new Date(payload.exp * 1000),
  };
}
