import prisma from "../src/prisma.js";
import { comparePassword, hashPassword } from "./passwordService.js";

export async function changeInitialAdminPassword(userId, newPassword) {
  const admin = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "ADMIN",
      status: "ACTIVE",
      deletedAt: null,
    },

    select: {
      id: true,
      passwordHash: true,
      mustChangePassword: true,
    },
  });

  if (!admin) {
    return {
      status: "ACCOUNT_UNAVAILABLE",
    };
  }

  if (!admin.mustChangePassword) {
    return {
      status: "PASSWORD_CHANGE_NOT_REQUIRED",
    };
  }

  const passwordReused = await comparePassword(newPassword, admin.passwordHash);

  if (passwordReused) {
    return {
      status: "PASSWORD_REUSED",
    };
  }

  const passwordHash = await hashPassword(newPassword);

  const passwordChangedAt = new Date();

  await prisma.user.update({
    where: {
      id: admin.id,
    },

    data: {
      passwordHash,
      passwordChangedAt,
      mustChangePassword: false,
    },
  });

  return {
    status: "PASSWORD_CHANGED",
    passwordChangedAt,
  };
}
