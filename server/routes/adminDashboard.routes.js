import { Router } from "express";
import { getDashboard } from "../controllers/adminDashboard.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import requireCompletedAdminPasswordChange from "../middleware/adminPasswordChangeMiddleware.js";
const router = Router();

router.use(
  requireAuthentication,
  requireRole("ADMIN"),
  requireCompletedAdminPasswordChange,
);
router.get("/", getDashboard);

export default router;
