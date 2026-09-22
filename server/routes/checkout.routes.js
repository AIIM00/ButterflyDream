import { Router } from "express";
import {
  createCheckoutOrder,
  getCheckout,
} from "../controllers/checkout.controller.js";
import {
  createCustomerManualOrder,
  createGuestOrder,
  getCheckoutOptions,
  previewCheckout,
} from "../controllers/guestCheckout.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = Router();

// Public checkout support for guest bags.
router.get("/options", getCheckoutOptions);
router.post("/preview", previewCheckout);
router.post("/guest-orders", createGuestOrder);

// Customer checkout using a manually entered address.
router.post(
  "/manual-orders",
  requireAuthentication,
  requireRole("CUSTOMER"),
  createCustomerManualOrder,
);

// Existing customer checkout using saved account addresses.
router.get("/", requireAuthentication, requireRole("CUSTOMER"), getCheckout);
router.post(
  "/orders",
  requireAuthentication,
  requireRole("CUSTOMER"),
  createCheckoutOrder,
);

export default router;
