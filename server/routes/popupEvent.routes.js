import { Router } from "express";

import {
  listPublicPopupComments,
  listPublicPopupEvents,
} from "../controllers/popupEvent.controller.js";

const router = Router();

/*
 * PUBLIC POPUP ROUTES
 *
 * Guests and logged-in users can read:
 * - published popup posts
 * - popup comments
 *
 * Likes, attendance, and commenting are handled
 * separately inside the CUSTOMER protected routes.
 */

/*
 * GET /api/popups
 *
 * Returns published popup posts.
 *
 * Supports:
 * ?page=1
 * ?limit=10
 */
router.get("/", listPublicPopupEvents);

/*
 * GET /api/popups/:popupEventId/comments
 *
 * Returns comments for a published popup event.
 *
 * Supports:
 * ?page=1
 * ?limit=20
 */
router.get("/:popupEventId/comments", listPublicPopupComments);

export default router;
