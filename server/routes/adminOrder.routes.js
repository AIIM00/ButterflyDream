import { Router } from "express";
import {
  cancelOrder,
  changeAdminOrderNote,
  changeAdminOrderPayment,
  changeAdminOrderStatus,
  getAdminOrder,
  listAdminOrders,
} from "../controllers/adminOrder.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import requireCompletedAdminPasswordChange from "../middleware/adminPasswordChangeMiddleware.js";
const router = Router();

router.use(
  requireAuthentication,
  requireRole("ADMIN"),
  requireCompletedAdminPasswordChange,
);
router.get("/", listAdminOrders);

router.get("/:orderId", getAdminOrder);

router.patch("/:orderId/status", changeAdminOrderStatus);

router.patch("/:orderId/cancel", cancelOrder);

router.patch("/:orderId/note", changeAdminOrderNote);

router.patch("/:orderId/payment", changeAdminOrderPayment);

export default router;
