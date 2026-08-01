import { Router } from "express";
import {
  getStoreSetting,
  updateStoreSetting,
} from "../controllers/adminStoreSetting.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = Router();

router.use(requireAuthentication, requireRole("ADMIN"));

router.get("/", getStoreSetting);

router.patch("/", updateStoreSetting);

export default router;
