import { Router } from "express";

import {
  listDeliveryGovernorates,
  updateDeliveryGovernorate,
} from "../controllers/adminDeliveryGovernorate.controller.js";

import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import requireCompletedAdminPasswordChange from "../middleware/adminPasswordChangeMiddleware.js";

const router = Router();

router.use(
  requireAuthentication,
  requireRole("ADMIN"),
  requireCompletedAdminPasswordChange,
);

router.get("/", listDeliveryGovernorates);

router.patch("/:governorateId", updateDeliveryGovernorate);

export default router;
