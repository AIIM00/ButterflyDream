import { Router } from "express";

import {
  createHomeSection,
  getAdminHomeSections,
  removeHomeSection,
  reorderHomeSections,
  updateHomeSection,
  getSiteTheme,
  updateSiteTheme,
} from "../controllers/adminSite.controller.js";
import {
  createSiteMediaUploadUrl,
  finalizeSiteMediaUpload,
  getSiteMediaAssets,
  removeSiteMediaAsset,
  updateSiteMediaAsset,
} from "../controllers/adminSiteMedia.controller.js";

import {
  createWebsitePreview,
  getPublicationStatus,
  publishWebsite,
} from "../controllers/adminSite.controller.js";

import requireAuthentication from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";
import requireCompletedAdminPasswordChange from "../middleware/adminPasswordChangeMiddleware.js";

const router = Router();

router.use(
  requireAuthentication,
  requireRole("ADMIN"),
  requireCompletedAdminPasswordChange,
);

router.get("/sections", getAdminHomeSections);

router.post("/sections", createHomeSection);

// Keep this BEFORE /sections/:sectionId
router.patch("/sections/reorder", reorderHomeSections);

router.patch("/sections/:sectionId", updateHomeSection);

router.delete("/sections/:sectionId", removeHomeSection);

// Website theme
router.get("/theme", getSiteTheme);

router.patch("/theme", updateSiteTheme);

router.post("/assets/upload-url", createSiteMediaUploadUrl);

router.post("/assets/finalize", finalizeSiteMediaUpload);

// Website Media Library

router.get("/assets", getSiteMediaAssets);

router.patch("/assets/:assetId", updateSiteMediaAsset);

router.delete("/assets/:assetId", removeSiteMediaAsset);

router.get("/publication", getPublicationStatus);

router.post("/publish", publishWebsite);
router.post("/preview-token", createWebsitePreview);

export default router;
