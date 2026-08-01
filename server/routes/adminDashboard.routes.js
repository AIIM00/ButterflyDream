import { Router } from "express";
import { getDashboard } from "../controllers/adminDashboard.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = Router();

router.use(requireAuthentication, requireRole("ADMIN"));

router.get("/", getDashboard);

export default router;
