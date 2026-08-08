import { Router } from "express";
import {
  getStoreSetting,
  updateStoreSetting,
} from "../controllers/adminStoreSetting.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import requireCompletedAdminPasswordChange from "../middleware/adminPasswordChangeMiddleware.js";
const router = Router();

router.use(
  requireAuthentication,
  requireRole("ADMIN"),
  requireCompletedAdminPasswordChange,
);
router.get("/", getStoreSetting);

router.patch("/", updateStoreSetting);

export default router;
