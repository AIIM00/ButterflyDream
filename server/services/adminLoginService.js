import adminLoginConfig from "../config/adminLoginConfig.js";
import prisma from "../src/prisma.js";
import {
  createOtpCode,
  invalidateOtpCode,
  verifyAndConsumeOtpCode,
} from "./otpService.js";
import { sendAdminLoginOtpEmail } from "./emailService.js";

const adminUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  emailVerifiedAt: true,
  lastLoginAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
};

export async function getEligibleAdminById(userId) {
  const admin = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: adminUserSelect,
  });

  if (
    !admin ||
    admin.role !== "ADMIN" ||
    admin.status !== "ACTIVE" ||
    admin.deletedAt !== null ||
    admin.emailVerifiedAt === null
  ) {
    return null;
  }

  return admin;
}

export async function issueAdminLoginOtp(admin) {
  const { code, otpRecord } = await createOtpCode({
    userId: admin.id,

    purpose: adminLoginConfig.otpPurpose,

    expiresInMinutes: adminLoginConfig.otpExpiresInMinutes,
  });

  try {
    await sendAdminLoginOtpEmail({
      recipientEmail: admin.email,
      otp: code,

      expiresInMinutes: adminLoginConfig.otpExpiresInMinutes,
    });
  } catch (error) {
    await invalidateOtpCode(otpRecord.id);

    const emailError = new Error(
      "The admin verification email could not be sent.",
    );

    emailError.code = "ADMIN_LOGIN_EMAIL_FAILED";

    emailError.cause = error;

    throw emailError;
  }

  return {
    otpId: otpRecord.id,
    expiresAt: otpRecord.expiresAt,
  };
}

export async function verifyAdminLoginOtp({ userId, otpId, code }) {
  const admin = await getEligibleAdminById(userId);

  if (!admin) {
    return {
      status: "ACCOUNT_UNAVAILABLE",
    };
  }

  const verificationResult = await verifyAndConsumeOtpCode({
    otpId,
    userId,

    purpose: adminLoginConfig.otpPurpose,

    code,

    maxAttempts: adminLoginConfig.maxAttempts,
  });

  if (verificationResult.status !== "VERIFIED") {
    return verificationResult;
  }

  const loggedInAdmin = await prisma.user.update({
    where: {
      id: admin.id,
    },

    data: {
      lastLoginAt: new Date(),
    },

    select: adminUserSelect,
  });

  return {
    status: "VERIFIED",
    user: loggedInAdmin,
  };
}
