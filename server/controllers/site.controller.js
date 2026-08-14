import { getPublicHomeContent } from "../services/siteContentService.js";
import { successResponse } from "../utils/apiResponse.js";

import jwt from "jsonwebtoken";

import { getDraftHomeContent } from "../services/siteContentService.js";

import { verifySitePreviewToken } from "../utils/sitePreviewToken.js";

export async function getHomeContent(request, response, next) {
  try {
    const home = await getPublicHomeContent();

    return successResponse(
      response,
      200,
      "Website content retrieved successfully.",
      home,
    );
  } catch (error) {
    return next(error);
  }
}

export async function getDraftHomePreview(request, response, next) {
  try {
    const previewToken = request.get("X-Site-Preview-Token");

    if (typeof previewToken !== "string" || previewToken.trim().length === 0) {
      return response.status(401).json({
        success: false,

        message: "A website preview token is required.",
      });
    }

    try {
      verifySitePreviewToken(previewToken);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return response.status(401).json({
          success: false,

          message:
            "This website preview has expired. Create a new preview from the admin dashboard.",
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return response.status(401).json({
          success: false,

          message: "This website preview link is invalid.",
        });
      }

      throw error;
    }

    const result = await getDraftHomeContent();

    response.set("Cache-Control", "private, no-store, max-age=0");

    return response.status(200).json({
      success: true,

      preview: true,

      ...result,
    });
  } catch (error) {
    return next(error);
  }
}
