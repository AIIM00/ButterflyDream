import { Router } from "express";
import { listAdminCustomers } from "../controllers/adminCustomer.controller.js";
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

export default router;
