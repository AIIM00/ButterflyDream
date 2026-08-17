import { Router } from "express";

import {
  createFeedback,
  deleteFeedback,
  getMyFeedback,
  listFeedback,
  updateFeedback,
} from "../controllers/feedback.controller.js";

import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = Router();

/*
 * PUBLIC
 *
 * Anyone visiting Butterfly Dream can read customer feedback.
 *
 * GET /api/feedback?page=1
 */
router.get("/", listFeedback);

/*
 * Everything below this point requires an authenticated CUSTOMER.
 */
router.use(requireAuthentication, requireRole("CUSTOMER"));

/*
 * CUSTOMER
 *
 * Get the logged-in customer's feedback.
 *
 * Returns:
 * {
 *   success: true,
 *   feedback: null
 * }
 *
 * if they have not reviewed yet.
 */
router.get("/me", getMyFeedback);

/*
 * CUSTOMER
 *
 * Submit the customer's first feedback.
 */
router.post("/", createFeedback);

/*
 * CUSTOMER
 *
 * Update the customer's existing feedback.
 */
router.patch("/me", updateFeedback);

/*
 * CUSTOMER
 *
 * Delete the logged-in customer's feedback.
 */
router.delete("/me", deleteFeedback);

export default router;
