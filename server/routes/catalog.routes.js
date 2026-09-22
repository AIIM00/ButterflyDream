import { Router } from "express";
import {
  getMetaCatalogFeed,
  getPublicProduct,
  listPublicCategories,
  listPublicProducts,
} from "../controllers/catalog.controller.js";

const router = Router();

router.get("/categories", listPublicCategories);

router.get("/products", listPublicProducts);

router.get("/meta-feed.csv", getMetaCatalogFeed);

router.get("/products/:slug", getPublicProduct);

export default router;
