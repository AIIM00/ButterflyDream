//Import necessary modules and services
import { Prisma } from "@prisma/client";
import { comparePassword, hashPassword } from "../services/passwordService.js";
import prisma from "../src/prisma.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import clearAuthCookie from "../utils/clearAuthCookie.js";
import generateAuthToken from "../utils/generateAuthToken.js";
import sanitizeUser from "../utils/sanitizeUser.js";
import setAuthCookie from "../utils/setAuthCookie.js";

// Import the customer email verification service functions
import {
  issueCustomerEmailVerificationOtp,
  verifyCustomerEmailVerificationOtp as verifyCustomerEmailOtpService,
} from "../services/customerEmailVerificationService.js";

// Import the password reset service functions
import {
  issuePasswordResetOtp,
  resetPasswordWithOtp,
} from "../services/passwordResetService.js";
// Import the password reset challenge utility functions
import {
  clearPasswordResetChallengeCookie,
  generatePasswordResetChallengeToken,
  getPasswordResetChallengeToken,
  setPasswordResetChallengeCookie,
  verifyPasswordResetChallengeToken,
} from "../utils/passwordResetChallenge.js";

import { changeInitialAdminPassword } from "../services/adminPasswordService.js";
import {
  AdminPasswordValidationError,
  parseInitialAdminPasswordInput,
} from "../utils/adminPasswordValidation.js";

// Utility function to normalize email addresses
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
// Function to validate registration input
function validateRegistrationInput({ fullName, email, password }) {
  if (
    typeof fullName !== "string" ||
    fullName.trim().length < 2 ||
    fullName.trim().length > 120
  ) {
    return "Full name must contain between 2 and 120 characters.";
  }

  if (
    typeof email !== "string" ||
    email.trim().length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return "Please provide a valid email address.";
  }

  if (typeof password !== "string" || password.length < 12) {
    return "Password must contain at least 12 characters.";
  }

  return null;
}
// Function to validate login input
function validateLoginInput({ email, password }) {
  if (typeof email !== "string" || email.trim().length === 0) {
    return "Email and password are required.";
  }

  if (typeof password !== "string" || password.length === 0) {
    return "Email and password are required.";
  }

  if (
    email.trim().length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return "Please provide a valid email address.";
  }

  return null;
}
// Function to validate password reset email input
function validatePasswordResetEmail(email) {
  if (
    typeof email !== "string" ||
    email.trim().length === 0 ||
    email.trim().length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return "Please provide a valid email address.";
  }

  return null;
}
// Function to validate password reset input
function resolvePasswordResetChallenge(request, response) {
  const challengeToken = getPasswordResetChallengeToken(request);

  if (!challengeToken) {
    errorResponse(
      response,
      401,
      "The password-reset request is missing or has expired.",
    );

    return null;
  }

  try {
    return verifyPasswordResetChallengeToken(challengeToken);
  } catch (error) {
    clearPasswordResetChallengeCookie(response);

    if (error?.name === "TokenExpiredError") {
      errorResponse(
        response,
        401,
        "The password-reset request has expired. Request a new code.",
      );

      return null;
    }

    if (error?.name === "JsonWebTokenError") {
      errorResponse(
        response,
        401,
        "The password-reset request is invalid. Request a new code.",
      );

      return null;
    }

    throw error;
  }
}

export async function register(request, response) {
  try {
    const { fullName, email, password } = request.body;

    const validationError = validateRegistrationInput({
      fullName,
      email,
      password,
    });

    if (validationError) {
      return errorResponse(response, 400, validationError);
    }

    const normalizedEmail = normalizeEmail(email);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return errorResponse(
        response,
        409,
        "An account with this email already exists.",
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          fullName: fullName.trim(),

          email: normalizedEmail,

          passwordHash,
          role: "CUSTOMER",
        },
      });

      await transaction.cart.create({
        data: {
          userId: createdUser.id,
        },
      });

      await transaction.wishlist.create({
        data: {
          userId: createdUser.id,
        },
      });

      return createdUser;
    });

    const token = generateAuthToken(user, {
      authenticationMethod: "PASSWORD",
    });

    setAuthCookie(response, token);
    let verificationEmailSent = false;
    let verificationCodeExpiresAt = null;

    try {
      const verificationResult = await issueCustomerEmailVerificationOtp(
        user.id,
      );

      if (verificationResult.status === "SENT") {
        verificationEmailSent = true;

        verificationCodeExpiresAt = verificationResult.expiresAt;
      }
    } catch (emailError) {
      console.error("Customer verification email error:", emailError);
    }

    return successResponse(
      response,
      201,
      verificationEmailSent
        ? "Account created successfully. A verification code was sent to your email."
        : "Account created successfully, but the verification email could not be sent. Request a new code from the verification page.",
      {
        user: sanitizeUser(user),
        requiresEmailVerification: true,
        verificationEmailSent,
        verificationCodeExpiresAt,
      },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResponse(
        response,
        409,
        "An account with this email already exists.",
      );
    }

    console.error("Registration error:", error);

    return errorResponse(response, 500, "Unable to create account.");
  }
}

export async function loginCustomer(request, response) {
  try {
    const { email, password } = request.body;

    const validationError = validateLoginInput({
      email,
      password,
    });

    if (validationError) {
      return errorResponse(response, 400, validationError);
    }

    const normalizedEmail = normalizeEmail(email);

    const customer = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        role: "CUSTOMER",
      },
    });

    if (!customer) {
      return errorResponse(response, 401, "Invalid email or password.");
    }

    const passwordMatches = await comparePassword(
      password,
      customer.passwordHash,
    );

    if (!passwordMatches) {
      return errorResponse(response, 401, "Invalid email or password.");
    }

    if (customer.deletedAt !== null || customer.status !== "ACTIVE") {
      clearAuthCookie(response);

      return errorResponse(
        response,
        403,
        "This account is currently unavailable.",
      );
    }

    const loggedInCustomer = await prisma.user.update({
      where: {
        id: customer.id,
      },

      data: {
        lastLoginAt: new Date(),
      },
    });

    const token = generateAuthToken(loggedInCustomer, {
      authenticationMethod: "PASSWORD",
    });

    setAuthCookie(response, token);

    return successResponse(response, 200, "Logged in successfully.", {
      user: sanitizeUser(loggedInCustomer),

      requiresEmailVerification: loggedInCustomer.emailVerifiedAt === null,
    });
  } catch (error) {
    console.error("Customer login error:", error);

    return errorResponse(response, 500, "Unable to log in.");
  }
}
export async function loginAdmin(request, response) {
  try {
    const { email, password } = request.body;

    const validationError = validateLoginInput({
      email,
      password,
    });

    if (validationError) {
      return errorResponse(response, 400, validationError);
    }

    const normalizedEmail = normalizeEmail(email);

    const admin = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        role: "ADMIN",
      },
    });

    if (!admin) {
      return errorResponse(response, 401, "Invalid email or password.");
    }

    const passwordMatches = await comparePassword(password, admin.passwordHash);

    if (!passwordMatches) {
      return errorResponse(response, 401, "Invalid email or password.");
    }

    if (admin.deletedAt !== null || admin.status !== "ACTIVE") {
      clearAuthCookie(response);

      return errorResponse(
        response,
        403,
        "This account is currently unavailable.",
      );
    }

    if (!admin.emailVerifiedAt) {
      clearAuthCookie(response);

      return errorResponse(
        response,
        403,
        "The admin email must be verified before login.",
      );
    }

    const loggedInAdmin = await prisma.user.update({
      where: {
        id: admin.id,
      },

      data: {
        lastLoginAt: new Date(),
      },
    });

    const authenticationToken = generateAuthToken(loggedInAdmin, {
      authenticationMethod: "PASSWORD",
    });

    setAuthCookie(response, authenticationToken);

    return successResponse(response, 200, "Admin logged in successfully.", {
      user: sanitizeUser(loggedInAdmin),
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return errorResponse(response, 500, "Unable to log in.");
  }
}

export function logout(_request, response) {
  clearAuthCookie(response);

  clearPasswordResetChallengeCookie(response);

  return successResponse(response, 200, "Logged out successfully.");
}

export function getCurrentUser(request, response) {
  return successResponse(
    response,
    200,
    "Authentication status retrieved successfully.",
    {
      user: request.user,
      session: request.auth,
    },
  );
}

export async function changeAdminInitialPassword(request, response, next) {
  try {
    const input = parseInitialAdminPasswordInput(request.body);

    const result = await changeInitialAdminPassword(
      request.user.id,
      input.newPassword,
    );

    if (result.status === "ACCOUNT_UNAVAILABLE") {
      clearAuthCookie(response);

      return errorResponse(
        response,
        403,
        "This admin account is currently unavailable.",
      );
    }

    if (result.status === "PASSWORD_CHANGE_NOT_REQUIRED") {
      return errorResponse(
        response,
        409,
        "The initial password has already been changed.",
      );
    }

    if (result.status === "PASSWORD_REUSED") {
      return errorResponse(
        response,
        409,
        "The new password must be different from the temporary password.",
      );
    }

    clearAuthCookie(response);

    return successResponse(
      response,
      200,
      "Password changed successfully. Please sign in again.",
      {
        requiresReauthentication: true,
      },
    );
  } catch (error) {
    if (error instanceof AdminPasswordValidationError) {
      return errorResponse(response, error.statusCode, error.message);
    }

    return next(error);
  }
}

export async function verifyCustomerEmail(request, response) {
  try {
    const { otp } = request.body;

    const verificationResult = await verifyCustomerEmailOtpService({
      userId: request.user.id,

      code: typeof otp === "string" ? otp.trim() : otp,
    });

    switch (verificationResult.status) {
      case "INVALID_FORMAT":
        return errorResponse(
          response,
          400,
          "The verification code must contain six digits.",
        );

      case "NO_ACTIVE_OTP":
        return errorResponse(
          response,
          400,
          "There is no active verification code. Request a new code.",
        );

      case "INVALID":
        return errorResponse(
          response,
          400,
          "The verification code is incorrect.",
        );

      case "EXPIRED":
        return errorResponse(
          response,
          400,
          "The verification code has expired. Request a new code.",
        );

      case "USED":
        return errorResponse(
          response,
          400,
          "This verification code is no longer valid.",
        );

      case "TOO_MANY_ATTEMPTS":
        return errorResponse(
          response,
          429,
          "Too many incorrect verification attempts. Request a new code.",
        );

      case "ACCOUNT_UNAVAILABLE":
        clearAuthCookie(response);

        return errorResponse(
          response,
          403,
          "This customer account is currently unavailable.",
        );

      case "ALREADY_VERIFIED":
        return successResponse(
          response,
          200,
          "Your email is already verified.",
          {
            user: sanitizeUser(verificationResult.user),

            requiresEmailVerification: false,
          },
        );

      case "VERIFIED":
        return successResponse(response, 200, "Email verified successfully.", {
          user: sanitizeUser(verificationResult.user),

          requiresEmailVerification: false,
        });

      default:
        throw new Error("Unknown customer email-verification result.");
    }
  } catch (error) {
    console.error("Customer email-verification error:", error);

    return errorResponse(response, 500, "Unable to verify the email address.");
  }
}
export async function resendCustomerEmailVerification(request, response) {
  try {
    const verificationResult = await issueCustomerEmailVerificationOtp(
      request.user.id,
    );

    if (verificationResult.status === "ACCOUNT_UNAVAILABLE") {
      clearAuthCookie(response);

      return errorResponse(
        response,
        403,
        "This customer account is currently unavailable.",
      );
    }

    if (verificationResult.status === "ALREADY_VERIFIED") {
      return successResponse(response, 200, "Your email is already verified.", {
        user: sanitizeUser(verificationResult.user),

        requiresEmailVerification: false,
      });
    }

    return successResponse(
      response,
      200,
      "A new verification code was sent to your email.",
      {
        requiresEmailVerification: true,

        email: maskEmail(verificationResult.user.email),

        expiresAt: verificationResult.expiresAt,
      },
    );
  } catch (error) {
    if (error?.code === "CUSTOMER_VERIFICATION_EMAIL_FAILED") {
      return errorResponse(
        response,
        503,
        "The verification email could not be sent. Please try again.",
      );
    }

    console.error("Customer verification resend error:", error);

    return errorResponse(
      response,
      500,
      "Unable to resend the verification code.",
    );
  }
}

export async function requestPasswordReset(request, response) {
  const genericMessage =
    "If an eligible account exists for this email, a password-reset code has been sent.";

  try {
    const { email } = request.body;

    const validationError = validatePasswordResetEmail(email);

    if (validationError) {
      return errorResponse(response, 400, validationError);
    }

    clearAuthCookie(response);

    clearPasswordResetChallengeCookie(response);

    const normalizedEmail = normalizeEmail(email);

    const resetResult = await issuePasswordResetOtp(normalizedEmail);

    if (resetResult.status === "SENT") {
      const challengeToken = generatePasswordResetChallengeToken({
        userId: resetResult.userId,

        otpId: resetResult.otpId,
      });

      setPasswordResetChallengeCookie(response, challengeToken);
    }

    return successResponse(response, 200, genericMessage);
  } catch (error) {
    if (error?.code === "PASSWORD_RESET_EMAIL_FAILED") {
      console.error(
        "Password-reset email delivery failed:",
        error.cause ?? error,
      );

      return successResponse(response, 200, genericMessage);
    }

    console.error("Password-reset request error:", error);

    return successResponse(response, 200, genericMessage);
  }
}
export async function confirmPasswordReset(request, response) {
  try {
    const challenge = resolvePasswordResetChallenge(request, response);

    if (!challenge) {
      return;
    }

    const { otp, newPassword } = request.body;

    const resetResult = await resetPasswordWithOtp({
      userId: challenge.userId,

      otpId: challenge.otpId,

      otp,
      newPassword,
    });

    switch (resetResult.status) {
      case "INVALID_PASSWORD":
        return errorResponse(response, 400, resetResult.message);

      case "INVALID_FORMAT":
        return errorResponse(
          response,
          400,
          "The verification code must contain six digits.",
        );

      case "INVALID":
        return errorResponse(
          response,
          400,
          "The verification code is incorrect.",
        );

      case "EXPIRED":
        clearPasswordResetChallengeCookie(response);

        return errorResponse(
          response,
          400,
          "The verification code has expired. Request a new code.",
        );

      case "USED":
        clearPasswordResetChallengeCookie(response);

        return errorResponse(
          response,
          400,
          "This verification code is no longer valid.",
        );

      case "TOO_MANY_ATTEMPTS":
        clearPasswordResetChallengeCookie(response);

        return errorResponse(
          response,
          429,
          "Too many incorrect verification attempts. Request a new code.",
        );

      case "PASSWORD_REUSED":
        return errorResponse(
          response,
          409,
          "The new password must be different from your current password.",
        );

      case "ACCOUNT_UNAVAILABLE":
        clearAuthCookie(response);

        clearPasswordResetChallengeCookie(response);

        return errorResponse(
          response,
          403,
          "This account is currently unavailable.",
        );

      case "PASSWORD_UPDATED":
        break;

      default:
        throw new Error("Unknown password-reset result.");
    }

    clearAuthCookie(response);

    clearPasswordResetChallengeCookie(response);

    return successResponse(
      response,
      200,
      "Password reset successfully. Please log in with your new password.",
    );
  } catch (error) {
    console.error("Password-reset confirmation error:", error);

    clearAuthCookie(response);

    return errorResponse(response, 500, "Unable to reset the password.");
  }
}
