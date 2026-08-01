import bcrypt from "bcryptjs";
import prisma from "../src/prisma.js";
import { comparePassword, hashPassword } from "./passwordService.js";
const profileSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

function serializeCustomerProfile(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,

    emailVerified: Boolean(user.emailVerifiedAt),

    emailVerifiedAt: user.emailVerifiedAt,

    createdAt: user.createdAt,

    updatedAt: user.updatedAt,
  };
}

export async function getCustomerProfile(userId) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "CUSTOMER",
      deletedAt: null,
    },

    select: profileSelect,
  });

  if (!user) {
    return {
      status: "NOT_FOUND",
    };
  }

  return {
    status: "FOUND",

    profile: serializeCustomerProfile(user),
  };
}

export async function updateCustomerProfile(userId, input) {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "CUSTOMER",
      deletedAt: null,
    },

    select: {
      id: true,
    },
  });

  if (!existingUser) {
    return {
      status: "NOT_FOUND",
    };
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      fullName: input.fullName,

      phone: input.phone,
    },

    select: profileSelect,
  });

  return {
    status: "UPDATED",

    profile: serializeCustomerProfile(user),
  };
}

export async function changeCustomerPassword(userId, input) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      role: "CUSTOMER",
      deletedAt: null,
    },

    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return {
      status: "NOT_FOUND",
    };
  }

  const currentPasswordMatches = await comparePassword(
    input.currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordMatches) {
    return {
      status: "INVALID_CURRENT_PASSWORD",
    };
  }

  const reusesCurrentPassword = await comparePassword(
    input.newPassword,
    user.passwordHash,
  );

  if (reusesCurrentPassword) {
    return {
      status: "PASSWORD_REUSED",
    };
  }

  const passwordHash = await hashPassword(input.newPassword);

  const passwordChangedAt = new Date();

  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: {
        id: userId,
      },

      data: {
        passwordHash,
        passwordChangedAt,
      },
    });

    await transaction.notification.create({
      data: {
        userId,
        type: "SYSTEM",

        title: "Password changed",

        message:
          "Your account password was changed successfully. All previous sessions were signed out.",

        data: {
          securityEvent: "PASSWORD_CHANGED",
        },
      },
    });
  });

  return {
    status: "PASSWORD_CHANGED",

    passwordChangedAt,
  };
}
