import "dotenv/config";
import app from "./app.js";
import prisma from "./prisma.js";
import securityConfig from "../config/securityConfig.js";

const rawPort = process.env.PORT ?? "5000";
const port = Number(rawPort);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(
    `PORT must be a valid integer between 1 and 65535. Received: ${rawPort}`,
  );
}

let server = null;
let isShuttingDown = false;

async function startServer() {
  try {
    await prisma.$connect();

    console.log("PostgreSQL database connected successfully.");

    server = app.listen(port, "0.0.0.0", () => {
      console.log(`Accessories platform API is running on port ${port}.`);

      console.log(`Environment: ${process.env.NODE_ENV ?? "development"}`);

      console.log(
        `Allowed frontend origins: ${securityConfig.allowedOrigins.join(", ")}`,
      );
    });
  } catch (error) {
    console.error("The server could not connect to PostgreSQL:", error);

    await prisma.$disconnect().catch(() => {});

    process.exit(1);
  }
}

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
