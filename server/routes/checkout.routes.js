import { Router } from "express";
import {
  createCheckoutOrder,
  getCheckout,
} from "../controllers/checkout.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = Router();

router.use(requireAuthentication, requireRole("CUSTOMER"));

router.get("/", getCheckout);

router.post("/orders", createCheckoutOrder);

export default router;
