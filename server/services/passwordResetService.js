import { comparePassword, hashPassword } from "./passwordService.js";
import passwordResetConfig from "../config/passwordResetConfig.js";
import prisma from "../src/prisma.js";
import {
  createOtpCode,
  invalidateOtpCode,
  verifyAndConsumeOtpCode,
} from "./otpService.js";
import { sendPasswordResetOtpEmail } from "./emailService.js";

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_BYTES = 72;

const passwordResetUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  passwordHash: true,
  role: true,
  status: true,
  emailVerifiedAt: true,
  passwordChangedAt: true,
  lastLoginAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
};

function validateNewPassword(password) {
  if (typeof password !== "string") {
    return "A new password is required.";
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return "The new password must contain at least 12 characters.";
  }

  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
    return "The new password must not exceed 72 UTF-8 bytes.";
  }

  if (!/[a-z]/.test(password)) {
    return "The new password must contain a lowercase letter.";
  }

  if (!/[A-Z]/.test(password)) {
    return "The new password must contain an uppercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "The new password must contain a number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "The new password must contain a special character.";
  }

  return null;
}

function isEligibleResetAccount(user) {
  return user !== null && user.status === "ACTIVE" && user.deletedAt === null;
}

export async function issuePasswordResetOtp(normalizedEmail) {
  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      role: "CUSTOMER",
    },

    select: passwordResetUserSelect,
  });
  if (!isEligibleResetAccount(user)) {
    return {
      status: "ACCOUNT_NOT_ELIGIBLE",
    };
  }

  const { code, otpRecord } = await createOtpCode({
    userId: user.id,

    purpose: passwordResetConfig.otpPurpose,

    expiresInMinutes: passwordResetConfig.otpExpiresInMinutes,
  });

  try {
    await sendPasswordResetOtpEmail({
      recipientEmail: user.email,
      userName: user.fullName,
      otp: code,

      expiresInMinutes: passwordResetConfig.otpExpiresInMinutes,
    });
  } catch (error) {
    await invalidateOtpCode(otpRecord.id);

    const emailError = new Error("The password-reset email could not be sent.");

    emailError.code = "PASSWORD_RESET_EMAIL_FAILED";

    emailError.cause = error;

    throw emailError;
  }

  return {
    status: "SENT",
    userId: user.id,
    otpId: otpRecord.id,
    expiresAt: otpRecord.expiresAt,
  };
}

export async function resetPasswordWithOtp({
  userId,
  otpId,
  otp,
  newPassword,
}) {
  const passwordValidationError = validateNewPassword(newPassword);

  if (passwordValidationError) {
    return {
      status: "INVALID_PASSWORD",
      message: passwordValidationError,
    };
  }

  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.findUnique({
      where: {
        id: userId,
      },

      select: passwordResetUserSelect,
    });

    if (!isEligibleResetAccount(user)) {
      return {
        status: "ACCOUNT_UNAVAILABLE",
      };
    }

    const verificationResult = await verifyAndConsumeOtpCode({
      otpId,
      userId,

      purpose: passwordResetConfig.otpPurpose,

      code: typeof otp === "string" ? otp.trim() : otp,

      maxAttempts: passwordResetConfig.maxAttempts,

      database: transaction,
    });

    if (verificationResult.status !== "VERIFIED") {
      return verificationResult;
    }

    const passwordAlreadyUsed = await comparePassword(
      newPassword,
      user.passwordHash,
    );

    if (passwordAlreadyUsed) {
      return {
        status: "PASSWORD_REUSED",
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    const passwordChangedAt = new Date();

    const updatedUser = await transaction.user.update({
      where: {
        id: user.id,
      },

      data: {
        passwordHash: newPasswordHash,

        passwordChangedAt,
      },

      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        passwordChangedAt: true,
      },
    });

    await transaction.otpCode.updateMany({
      where: {
        userId: user.id,

        purpose: passwordResetConfig.otpPurpose,

        usedAt: null,
      },

      data: {
        usedAt: passwordChangedAt,
      },
    });

    return {
      status: "PASSWORD_UPDATED",
      user: updatedUser,
    };
  });
}
