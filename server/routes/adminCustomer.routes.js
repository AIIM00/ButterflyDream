import { Router } from "express";
import {
  getAdminCustomer,
  listAdminCustomers,
} from "../controllers/adminCustomer.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import requireCompletedAdminPasswordChange from "../middleware/adminPasswordChangeMiddleware.js";

const router = Router();

router.use(
  requireAuthentication,
  requireRole("ADMIN"),
  requireCompletedAdminPasswordChange,
);

router.get("/", listAdminCustomers);
router.get("/:customerId", getAdminCustomer);

export default router;
