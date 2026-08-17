import { afterAll, beforeAll, beforeEach } from "vitest";
import prisma from "../src/prisma.js";

function ensureTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (!databaseUrl.toLowerCase().includes("test")) {
    throw new Error(
      "Automated tests must use a database whose URL contains the word 'test'.",
    );
  }
}

async function clearTestDatabase() {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.orderStatusHistory.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),

    prisma.cartItem.deleteMany(),
    prisma.wishlistItem.deleteMany(),

    prisma.productImage.deleteMany(),
    prisma.inventory.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),

    prisma.address.deleteMany(),
    prisma.otpCode.deleteMany(),

    prisma.cart.deleteMany(),
    prisma.wishlist.deleteMany(),

    prisma.deliveryGovernorate.deleteMany(),
    prisma.storeSetting.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

beforeAll(async () => {
  ensureTestDatabase();

  await prisma.$connect();
});

beforeEach(async () => {
  await clearTestDatabase();
});

afterAll(async () => {
  await clearTestDatabase();

  await prisma.$disconnect();
});
