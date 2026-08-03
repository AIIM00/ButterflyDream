import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import prisma from "./prisma.js";

// Security
import applySecurityMiddleware from "../middleware/securityMiddleware.js";
import {
  adminRateLimiter,
  apiRateLimiter,
  authRateLimiter,
  checkoutRateLimiter,
} from "../middleware/rateLimitMiddleware.js";

// Public and customer routes
import authRoutes from "../routes/auth.routes.js";
import catalogRoutes from "../routes/catalog.routes.js";
import cartRoutes from "../routes/cart.routes.js";
import checkoutRoutes from "../routes/checkout.routes.js";
import customerRoutes from "../routes/customer.routes.js";

// Admin routes
import adminCategoryRoutes from "../routes/adminCategory.routes.js";
import adminDashboardRoutes from "../routes/adminDashboard.routes.js";
import adminOrderRoutes from "../routes/adminOrder.routes.js";
import adminProductRoutes from "../routes/adminProduct.routes.js";
import adminStoreSettingRoutes from "../routes/adminStoreSetting.routes.js";

const app = express();

applySecurityMiddleware(app);

app.use(cookieParser());

// Global API limit
app.use("/api", apiRateLimiter);

// More specific limits
app.use("/api/auth", authRateLimiter);
app.use("/api/checkout", checkoutRateLimiter);
app.use("/api/admin", adminRateLimiter);

app.get("/api/health", async (request, response, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return response.status(200).json({
      success: true,
      message: "Accessories platform API is running.",
      database: "connected",
      environment: process.env.NODE_ENV ?? "development",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
});

// Authentication and customer routes
app.use("/api/auth", authRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/customer", customerRoutes);

// Admin routes
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/settings", adminStoreSettingRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

// 404 handler
app.use((request, response) => {
  return response.status(404).json({
    success: false,
    message: `Route ${request.method} ${request.originalUrl} was not found.`,
  });
});

// Global error handler
app.use((error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  if (error.code === "CORS_ORIGIN_NOT_ALLOWED") {
    return response.status(403).json({
      success: false,
      message: "This website is not allowed to access the API.",
      ...(request.requestId
        ? {
            requestId: request.requestId,
          }
        : {}),
    });
  }

  if (
    error.type === "entity.parse.failed" ||
    (error instanceof SyntaxError &&
      error.status === 400 &&
      Object.prototype.hasOwnProperty.call(error, "body"))
  ) {
    return response.status(400).json({
      success: false,
      message: "The request body contains invalid JSON.",
      ...(request.requestId
        ? {
            requestId: request.requestId,
          }
        : {}),
    });
  }

  if (
    error.type === "entity.too.large" ||
    error.status === 413 ||
    error.statusCode === 413
  ) {
    return response.status(413).json({
      success: false,
      message: "The request body is too large.",
      ...(request.requestId
        ? {
            requestId: request.requestId,
          }
        : {}),
    });
  }

  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
      ? error.statusCode
      : Number.isInteger(error.status) &&
          error.status >= 400 &&
          error.status <= 599
        ? error.status
        : 500;

  if (statusCode >= 500) {
    console.error("Unexpected server error:", {
      requestId: request.requestId ?? null,
      method: request.method,
      path: request.originalUrl,
      error,
    });
  }

  const message =
    statusCode === 500
      ? "An unexpected server error occurred."
      : error.message || "The request could not be completed.";

  return response.status(statusCode).json({
    success: false,
    message,
    ...(request.requestId
      ? {
          requestId: request.requestId,
        }
      : {}),
  });
});

export default app;
