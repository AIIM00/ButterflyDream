import { Router } from "express";
import {
  archiveProduct,
  archiveVariant,
  changeProductStatus,
  changeVariantStatus,
  createProduct,
  createProductImage,
  createVariant,
  deleteProductImage,
  getAdminProduct,
  getAdminProducts,
  updateInventory,
  updateProduct,
  updateProductImage,
  updateVariant,
} from "../controllers/adminProduct.controller.js";
import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = Router();

router.use(requireAuthentication, requireRole("ADMIN"));

router.get("/", getAdminProducts);

router.post("/", createProduct);

router.get("/:productId", getAdminProduct);

router.patch("/:productId", updateProduct);

router.patch("/:productId/status", changeProductStatus);

router.patch("/:productId/archive", archiveProduct);

router.post("/:productId/variants", createVariant);

router.patch("/:productId/variants/:variantId", updateVariant);

router.patch("/:productId/variants/:variantId/status", changeVariantStatus);

router.patch("/:productId/variants/:variantId/inventory", updateInventory);

router.patch("/:productId/variants/:variantId/archive", archiveVariant);

router.post("/:productId/images", createProductImage);

router.patch("/:productId/images/:imageId", updateProductImage);

router.delete("/:productId/images/:imageId", deleteProductImage);

export default router;
