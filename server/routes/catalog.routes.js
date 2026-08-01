import { Router } from "express";
import {
  getPublicProduct,
  listPublicCategories,
  listPublicProducts,
} from "../controllers/catalog.controller.js";

const router = Router();

router.get("/categories", listPublicCategories);

router.get("/products", listPublicProducts);

router.get("/products/:slug", getPublicProduct);

export default router;
