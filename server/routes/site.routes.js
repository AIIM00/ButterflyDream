import { Router } from "express";

import {
  getDraftHomePreview,
  getHomeContent,
} from "../controllers/site.controller.js";

const router = Router();

router.get("/home", getHomeContent);
router.get("/preview", getDraftHomePreview);

export default router;
