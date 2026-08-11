import { Router } from "express";
import {
  createCategory,
  getAdminCategories,
  reorderCategories,
  updateCategory,
  updateCategoryStatus,
} from "../controllers/adminCategory.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import requireCompletedAdminPasswordChange from "../middleware/adminPasswordChangeMiddleware.js";
import {
  createCategoryImageUploadUrl,
  finalizeCategoryImageUpload,
} from "../controllers/adminCategoryImageUpload.controller.js";

const router = Router();

router.use(
  requireAuthentication,
  requireRole("ADMIN"),
  requireCompletedAdminPasswordChange,
);
router.get("/", getAdminCategories);

router.post("/", createCategory);

router.patch("/reorder", reorderCategories);

router.patch("/:categoryId/status", updateCategoryStatus);

router.post("/:categoryId/image/upload-url", createCategoryImageUploadUrl);

router.post("/:categoryId/image/finalize", finalizeCategoryImageUpload);

router.patch("/:categoryId", updateCategory);

export default router;
