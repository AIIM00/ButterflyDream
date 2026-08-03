import "dotenv/config";
import app from "./app.js";
import prisma from "./prisma.js";

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

    server = app.listen(port, () => {
      console.log(`Accessories platform API is running on port ${port}.`);

      console.log(`Environment: ${process.env.NODE_ENV ?? "development"}`);

      console.log(
        `Allowed frontend origin: ${
          process.env.FRONTEND_URL ?? process.env.CLIENT_URL ?? "not configured"
        }`,
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
