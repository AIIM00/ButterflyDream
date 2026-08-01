import { rateLimit } from "express-rate-limit";
import securityConfig from "../config/securityConfig.js";

function minutesToMilliseconds(minutes) {
  return minutes * 60 * 1000;
}

function createRateLimitHandler(message) {
  return (request, response) => {
    return response.status(429).json({
      success: false,
      message,
    });
  };
}

export const apiRateLimiter = rateLimit({
  windowMs: minutesToMilliseconds(securityConfig.apiRateLimit.windowMinutes),

  limit: securityConfig.apiRateLimit.maxRequests,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  handler: createRateLimitHandler(
    "Too many requests were sent from this device. Please try again later.",
  ),
});

export const authRateLimiter = rateLimit({
  windowMs: minutesToMilliseconds(securityConfig.authRateLimit.windowMinutes),

  limit: securityConfig.authRateLimit.maxRequests,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  handler: createRateLimitHandler(
    "Too many authentication attempts. Please wait before trying again.",
  ),
});

export const checkoutRateLimiter = rateLimit({
  windowMs: minutesToMilliseconds(
    securityConfig.checkoutRateLimit.windowMinutes,
  ),

  limit: securityConfig.checkoutRateLimit.maxRequests,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  handler: createRateLimitHandler(
    "Too many checkout requests. Please wait before placing another order.",
  ),
});

export const adminRateLimiter = rateLimit({
  windowMs: minutesToMilliseconds(securityConfig.adminRateLimit.windowMinutes),

  limit: securityConfig.adminRateLimit.maxRequests,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  handler: createRateLimitHandler(
    "Too many admin requests. Please try again later.",
  ),
});
