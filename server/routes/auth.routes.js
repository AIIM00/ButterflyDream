import { Router } from "express";
import {
  getCurrentUser,
  register,
  loginAdmin,
  loginCustomer,
  logout,
  resendAdminLoginOtp,
  resendCustomerEmailVerification,
  verifyAdminLoginOtp,
  verifyCustomerEmail,
  requestPasswordReset,
  confirmPasswordReset,
} from "../controllers/auth.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import {
  loginRateLimiter,
  otpRequestRateLimiter,
  otpVerificationRateLimiter,
} from "../middleware/authRateLimiter.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/register", register);

router.post("/login", loginRateLimiter, loginCustomer);

router.post("/admin", loginRateLimiter, loginAdmin);
router.post(
  "/admin/verify-login-otp",
  otpVerificationRateLimiter,
  verifyAdminLoginOtp,
);
router.post(
  "/admin/resend-login-otp",
  otpRequestRateLimiter,
  resendAdminLoginOtp,
);
router.post(
  "/email-verification/verify",
  otpVerificationRateLimiter,
  requireAuthentication,
  requireRole("CUSTOMER"),
  verifyCustomerEmail,
);

router.post(
  "/email-verification/resend",
  otpRequestRateLimiter,
  requireAuthentication,
  requireRole("CUSTOMER"),
  resendCustomerEmailVerification,
);
router.post(
  "/password-reset/request",
  otpRequestRateLimiter,
  requestPasswordReset,
);

router.post(
  "/password-reset/confirm",
  otpVerificationRateLimiter,
  confirmPasswordReset,
);

router.post("/logout", logout);

router.get("/me", requireAuthentication, getCurrentUser);
router.get(
  "/admin/check",
  requireAuthentication,
  requireRole("ADMIN"),
  getCurrentUser,
);

export default router;
