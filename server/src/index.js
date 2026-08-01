import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import prisma from "./prisma.js";

//Authentication and user management routes
import authRoutes from "../routes/auth.routes.js";
import catalogRoutes from "../routes/catalog.routes.js";
import cartRoutes from "../routes/cart.routes.js";
import checkoutRoutes from "../routes/checkout.routes.js";

// Admin routes
import adminCategoryRoutes from "../routes/adminCategory.routes.js";
import adminProductRoutes from "../routes/adminProduct.routes.js";
import adminOrderRoutes from "../routes/adminOrder.routes.js";
import adminDashboardRoutes from "../routes/adminDashboard.routes.js";
import adminStoreSettingRoutes from "../routes/adminStoreSetting.routes.js";

//Customer routes
import customerRoutes from "../routes/customer.routes.js";

const app = express();

const rawPort = process.env.PORT ?? "5000";
const port = Number(rawPort);
const frontendUrl = process.env.FRONTEND_URL?.trim();

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(
    `PORT must be a valid integer between 1 and 65535. Received: ${rawPort}`,
  );
}

if (!frontendUrl) {
  throw new Error("FRONTEND_URL is missing. Add it to the server .env file.");
}

try {
  new URL(frontendUrl);
} catch {
  throw new Error(`FRONTEND_URL must be a valid URL. Received: ${frontendUrl}`);
}

app.disable("x-powered-by");

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.use(cookieParser());

app.get("/api/health", async (request, response) => {
  await prisma.$queryRaw`SELECT 1`;

  response.status(200).json({
    success: true,
    message: "Accessories platform API is running.",
    database: "connected",
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  });
});

// API routes
// Authentication and user management routes
app.use("/api/auth", authRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/customer", customerRoutes);

// Admin routess
app.use("/api/admin/dashboard", adminDashboardRoutes);

app.use("/api/admin/settings", adminStoreSettingRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

// 404 handler
app.use((request, response) => {
  response.status(404).json({
    success: false,
    message: `Route ${request.method} ${request.originalUrl} was not found.`,
  });
});

app.use((error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }

  console.error("Unexpected server error:", error);

  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
      ? error.statusCode
      : 500;

  const message =
    statusCode === 500 ? "An unexpected server error occurred." : error.message;

  return response.status(statusCode).json({
    success: false,
    message,
  });
});

let server;

async function startServer() {
  try {
    await prisma.$connect();

    console.log("PostgreSQL database connected successfully.");

    server = app.listen(port, () => {
      console.log(`Accessories platform API is running on port ${port}.`);
      console.log(`Environment: ${process.env.NODE_ENV ?? "development"}`);
      console.log(`Allowed frontend origin: ${frontendUrl}`);
    });
  } catch (error) {
    console.error("The server could not connect to PostgreSQL:", error);

    await prisma.$disconnect().catch(() => {});

    process.exit(1);
  }
}

let isShuttingDown = false;

async function shutDownServer(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`${signal} received. Closing the server...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }

    await prisma.$disconnect();

    console.log("HTTP server and database connection closed successfully.");

    process.exit(0);
  } catch (error) {
    console.error("The server could not shut down cleanly:", error);

    process.exit(1);
  }
}

process.once("SIGINT", () => {
  void shutDownServer("SIGINT");
});

process.once("SIGTERM", () => {
  void shutDownServer("SIGTERM");
});

void startServer();
