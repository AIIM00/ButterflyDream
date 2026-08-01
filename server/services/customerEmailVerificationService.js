import emailVerificationConfig from "../config/emailVerificationConfig.js";
import prisma from "../src/prisma.js";
import { sendCustomerEmailVerificationOtpEmail } from "./emailService.js";
import {
  createOtpCode,
  invalidateOtpCode,
  verifyAndConsumeOtpCode,
} from "./otpService.js";

const customerUserSelect = {
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

async function findCustomerById(userId, database = prisma) {
  return database.user.findUnique({
    where: {
      id: userId,
    },

    select: customerUserSelect,
  });
}

function isEligibleCustomer(customer) {
  return (
    customer !== null &&
    customer.role === "CUSTOMER" &&
    customer.status === "ACTIVE" &&
    customer.deletedAt === null
  );
}

export async function issueCustomerEmailVerificationOtp(userId) {
  const customer = await findCustomerById(userId);

  if (!isEligibleCustomer(customer)) {
    return {
      status: "ACCOUNT_UNAVAILABLE",
    };
  }

  if (customer.emailVerifiedAt !== null) {
    return {
      status: "ALREADY_VERIFIED",
      user: customer,
    };
  }

  const { code, otpRecord } = await createOtpCode({
    userId: customer.id,

    purpose: emailVerificationConfig.otpPurpose,

    expiresInMinutes: emailVerificationConfig.otpExpiresInMinutes,
  });

  try {
    await sendCustomerEmailVerificationOtpEmail({
      recipientEmail: customer.email,
      customerName: customer.fullName,
      otp: code,

      expiresInMinutes: emailVerificationConfig.otpExpiresInMinutes,
    });
  } catch (error) {
    await invalidateOtpCode(otpRecord.id);

    const emailError = new Error(
      "The customer verification email could not be sent.",
    );

    emailError.code = "CUSTOMER_VERIFICATION_EMAIL_FAILED";

    emailError.cause = error;

    throw emailError;
  }

  return {
    status: "SENT",
    user: customer,
    expiresAt: otpRecord.expiresAt,
  };
}

export async function verifyCustomerEmailVerificationOtp({ userId, code }) {
  return prisma.$transaction(async (transaction) => {
    const customer = await findCustomerById(userId, transaction);

    if (!isEligibleCustomer(customer)) {
      return {
        status: "ACCOUNT_UNAVAILABLE",
      };
    }

    if (customer.emailVerifiedAt !== null) {
      return {
        status: "ALREADY_VERIFIED",

        user: customer,
      };
    }

    const otpRecord = await transaction.otpCode.findFirst({
      where: {
        userId: customer.id,

        purpose: emailVerificationConfig.otpPurpose,

        usedAt: null,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
      },
    });

    if (!otpRecord) {
      return {
        status: "NO_ACTIVE_OTP",
      };
    }

    const verificationResult = await verifyAndConsumeOtpCode({
      otpId: otpRecord.id,
      userId: customer.id,

      purpose: emailVerificationConfig.otpPurpose,

      code,

      maxAttempts: emailVerificationConfig.maxAttempts,

      database: transaction,
    });

    if (verificationResult.status !== "VERIFIED") {
      return verificationResult;
    }

    const verifiedCustomer = await transaction.user.update({
      where: {
        id: customer.id,
      },

      data: {
        emailVerifiedAt: new Date(),
      },

      select: customerUserSelect,
    });

    return {
      status: "VERIFIED",
      user: verifiedCustomer,
    };
  });
}
