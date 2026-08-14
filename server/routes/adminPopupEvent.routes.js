import { Router } from "express";

import {
  changePopupEventStatus,
  createPopupEvent,
  getAdminPopupEvent,
  getAdminPopupEvents,
  removePopupCommentAsAdmin,
  reorderPopupEvents,
  updatePopupEvent,
} from "../controllers/adminPopupEvent.controller.js";

import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import requireCompletedAdminPasswordChange from "../middleware/adminPasswordChangeMiddleware.js";

const router = Router();

router.use(
  requireAuthentication,
  requireRole("ADMIN"),
  requireCompletedAdminPasswordChange,
);

router.get("/", getAdminPopupEvents);

router.post("/", createPopupEvent);

/*
 * Keep this BEFORE /:popupEventId
 * so "reorder" is not interpreted
 * as a UUID.
 */
router.post("/reorder", reorderPopupEvents);

router.delete("/comments/:commentId", removePopupCommentAsAdmin);

router.get("/:popupEventId", getAdminPopupEvent);

router.patch("/:popupEventId", updatePopupEvent);

router.patch("/:popupEventId/status", changePopupEventStatus);

export default router;
