import crypto from "node:crypto";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import corsConfig from "../config/corsConfig.js";
import securityConfig from "../config/securityConfig.js";

function addRequestId(request, response, next) {
  const existingRequestId = request.get("X-Request-ID")?.trim();

  const requestId = existingRequestId || crypto.randomUUID();

  request.requestId = requestId;

  response.setHeader("X-Request-ID", requestId);

  next();
}

export default function applySecurityMiddleware(app) {
  app.disable("x-powered-by");

  if (securityConfig.trustProxy !== false) {
    app.set("trust proxy", securityConfig.trustProxy);
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: "cross-origin",
      },

      hsts: securityConfig.isProduction
        ? {
            maxAge: 31536000,

            includeSubDomains: true,

            preload: true,
          }
        : false,
    }),
  );

  app.use(cors(corsConfig));

  app.use(addRequestId);

  app.use(
    express.json({
      limit: securityConfig.requestBodyLimit,

      strict: true,
    }),
  );

  app.use(
    express.urlencoded({
      extended: true,

      limit: securityConfig.requestBodyLimit,

      parameterLimit: 100,
    }),
  );
}
