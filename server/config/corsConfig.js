import securityConfig from "./securityConfig.js";

function normalizeOrigin(origin) {
  return origin.replace(/\/+$/, "");
}

const corsConfig = {
  origin(origin, callback) {
    // Requests from tools such as Postman or server-to-server requests
    // might not contain an Origin header.
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);

    const isAllowed = securityConfig.allowedOrigins.includes(normalizedOrigin);

    if (isAllowed) {
      callback(null, true);
      return;
    }

    const error = new Error("This request origin is not allowed.");

    error.code = "CORS_ORIGIN_NOT_ALLOWED";

    callback(error);
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],

  exposedHeaders: ["RateLimit", "RateLimit-Policy", "Retry-After"],

  optionsSuccessStatus: 204,

  maxAge: 60 * 60,
};

export default corsConfig;
