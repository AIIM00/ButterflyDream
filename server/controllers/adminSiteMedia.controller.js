import { errorResponse, successResponse } from "../utils/apiResponse.js";

import {
  AdminSiteMediaValidationError,
  parseSiteMediaAssetId,
  parseSiteMediaFinalizeRequest,
  parseSiteMediaListQuery,
  parseSiteMediaUpdateRequest,
  parseSiteMediaUploadRequest,
} from "../utils/adminSiteMediaValidation.js";

import { createSiteMediaUploadUrl as createSiteMediaUploadUrlService } from "../services/r2SiteMediaUploadService.js";

import { finalizeSiteMediaUpload as finalizeSiteMediaUploadService } from "../services/r2SiteMediaFinalizeService.js";
import {
  deleteAdminSiteMediaAsset,
  listAdminSiteMediaAssets,
  updateAdminSiteMediaAsset,
} from "../services/adminSiteMediaLibraryService.js";

function handleMediaError(error, response, next) {
  if (error instanceof AdminSiteMediaValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  return next(error);
}

export async function createSiteMediaUploadUrl(request, response, next) {
  try {
    const input = parseSiteMediaUploadRequest(request.body);

    const upload = await createSiteMediaUploadUrlService(input);

    return successResponse(
      response,
      200,
      "Website image upload URL created successfully.",
      {
        upload,
      },
    );
  } catch (error) {
    return handleMediaError(error, response, next);
  }
}

export async function finalizeSiteMediaUpload(request, response, next) {
  try {
    const input = parseSiteMediaFinalizeRequest(request.body);

    const result = await finalizeSiteMediaUploadService(input);

    if (result.status === "INVALID_OBJECT_KEY") {
      return errorResponse(
        response,
        400,
        "The uploaded image does not belong to the website media library.",
      );
    }

    if (result.status === "OBJECT_NOT_FOUND") {
      return errorResponse(
        response,
        409,
        "The uploaded website image could not be found in storage.",
      );
    }

    if (result.status === "INVALID_OBJECT") {
      return errorResponse(
        response,
        400,
        "The uploaded file is not a valid supported website image.",
      );
    }

    if (result.status === "ALREADY_REGISTERED") {
      return successResponse(
        response,
        200,
        "Website image is already registered.",
        {
          asset: result.asset,
        },
      );
    }

    return successResponse(
      response,
      201,
      "Website image added to the media library successfully.",
      {
        asset: result.asset,
      },
    );
  } catch (error) {
    return handleMediaError(error, response, next);
  }
}
export async function getSiteMediaAssets(request, response, next) {
  try {
    const input = parseSiteMediaListQuery(request.query);

    const result = await listAdminSiteMediaAssets(input);

    return successResponse(
      response,
      200,
      "Website media retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleMediaError(error, response, next);
  }
}

export async function updateSiteMediaAsset(request, response, next) {
  try {
    const assetId = parseSiteMediaAssetId(request.params.assetId);

    const input = parseSiteMediaUpdateRequest(request.body);

    const asset = await updateAdminSiteMediaAsset(assetId, input);

    if (!asset) {
      return errorResponse(response, 404, "Website media asset not found.");
    }

    return successResponse(
      response,
      200,
      "Website media updated successfully.",
      {
        asset,
      },
    );
  } catch (error) {
    return handleMediaError(error, response, next);
  }
}

export async function removeSiteMediaAsset(request, response, next) {
  try {
    const assetId = parseSiteMediaAssetId(request.params.assetId);

    const result = await deleteAdminSiteMediaAsset(assetId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Website media asset not found.");
    }

    if (result.status === "IN_USE") {
      return errorResponse(
        response,
        409,
        "This image is currently being used by a homepage section. Remove it from the section before deleting it.",
        {
          references: result.references,
        },
      );
    }

    if (result.status === "DELETED_WITH_STORAGE_WARNING") {
      return successResponse(
        response,
        200,
        "The media asset was removed from the website, but its Cloudflare storage object could not be cleaned up.",
        {
          deletedAsset: result.asset,

          storageCleanupPending: true,
        },
      );
    }

    return successResponse(
      response,
      200,
      "Website media deleted successfully.",
      {
        deletedAsset: result.asset,

        storageCleanupPending: false,
      },
    );
  } catch (error) {
    return handleMediaError(error, response, next);
  }
}
