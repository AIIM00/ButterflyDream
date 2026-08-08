import { Router } from "express";

import {
  createInStoreSale,
  getInStoreSaleProducts,
  getInStoreSalesHistory,
} from "../controllers/inStoreSaleController.js";
import requireCompletedAdminPasswordChange from "../middleware/adminPasswordChangeMiddleware.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = Router();

router.use(
  requireAuthentication,
  requireRole("ADMIN"),
  requireCompletedAdminPasswordChange,
);
// Products available for the physical-store POS
router.get("/products", getInStoreSaleProducts);

// Physical-store sales history
router.get("/", getInStoreSalesHistory);

// Record a new physical-store sale
router.post("/", createInStoreSale);

export default router;
