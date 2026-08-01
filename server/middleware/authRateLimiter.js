import { rateLimit } from "express-rate-limit";

function createRateLimitHandler(message) {
  return function rateLimitHandler(_request, response, _next, options) {
    return response.status(options.statusCode).json({
      success: false,
      message,
    });
  };
}

const sharedOptions = {
  standardHeaders: "draft-8",
  legacyHeaders: false,
};

export const loginRateLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: createRateLimitHandler(
    "Too many failed login attempts. Please try again later.",
  ),
});

export const otpRequestRateLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  handler: createRateLimitHandler(
    "Too many OTP requests. Please try again later.",
  ),
});

export const otpVerificationRateLimiter = rateLimit({
  ...sharedOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  handler: createRateLimitHandler(
    "Too many OTP verification attempts. Please try again later.",
  ),
});
