import prisma from "../../src/prisma.js";
import { hashPassword } from "../../services/passwordService.js";

export const TEST_CUSTOMER_PASSWORD = "CustomerPassword123!";

export const TEST_ADMIN_PASSWORD = "AdminPassword123!";

export async function createTestUser({
  fullName = "Test Customer",

  email = "customer.test@example.com",

  password = TEST_CUSTOMER_PASSWORD,

  role = "CUSTOMER",

  status = "ACTIVE",

  emailVerified = true,
} = {}) {
  const passwordHash = await hashPassword(password);

  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.create({
      data: {
        fullName,

        email: email.trim().toLowerCase(),

        passwordHash,

        role,
        status,

        emailVerifiedAt: emailVerified ? new Date() : null,
      },
    });

    if (role === "CUSTOMER") {
      await transaction.cart.create({
        data: {
          userId: user.id,
        },
      });

      await transaction.wishlist.create({
        data: {
          userId: user.id,
        },
      });
    }

    return user;
  });
}
