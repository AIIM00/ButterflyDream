import { createProductImageUploadUrl as createProductImageUploadUrlService } from "../services/r2ProductImageUploadService.js";

import {
  AdminProductImageUploadValidationError,
  parseProductImageFinalizeRequest,
  parseProductImageUploadRequest,
} from "../utils/adminProductImageUploadValidation.js";

import {
  AdminProductValidationError,
  parseProductId,
} from "../utils/adminProductValidation.js";

import { errorResponse, successResponse } from "../utils/apiResponse.js";
import { finalizeProductImageUpload as finalizeProductImageUploadService } from "../services/r2ProductImageFinalizeService.js";

export async function createProductImageUploadUrl(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const input = parseProductImageUploadRequest(request.body);

    const result = await createProductImageUploadUrlService(productId, input);

    if (result.status === "PRODUCT_NOT_FOUND") {
      return errorResponse(response, 404, "Product not found.");
    }

    if (result.status === "PRODUCT_ARCHIVED") {
      return errorResponse(
        response,
        409,
        "Images cannot be uploaded to an archived product.",
      );
    }

    if (result.status === "IMAGE_LIMIT_REACHED") {
      return errorResponse(
        response,
        409,
        "This product already contains the maximum of 8 images.",
      );
    }

    return successResponse(
      response,
      200,
      "Product image upload URL created successfully.",
      {
        upload: result.upload,
      },
    );
  } catch (error) {
    if (
      error instanceof AdminProductImageUploadValidationError ||
      error instanceof AdminProductValidationError
    ) {
      return errorResponse(response, error.statusCode, error.message);
    }

    /*
     * parseProductId uses the existing
     * AdminProductValidationError class.
     * Forward it through the current global
     * error handler for now.
     */
    return next(error);
  }
}
export async function finalizeProductImageUpload(request, response, next) {
  try {
    const productId = parseProductId(request.params.productId);

    const input = parseProductImageFinalizeRequest(request.body);

    const result = await finalizeProductImageUploadService(productId, input);

    if (result.status === "PRODUCT_NOT_FOUND") {
      return errorResponse(response, 404, "Product not found.");
    }

    if (result.status === "PRODUCT_ARCHIVED") {
      return errorResponse(
        response,
        409,
        "Images cannot be added to an archived product.",
      );
    }

    if (result.status === "INVALID_OBJECT_KEY") {
      return errorResponse(
        response,
        400,
        "The uploaded image does not belong to this product.",
      );
    }

    if (result.status === "OBJECT_NOT_FOUND") {
      return errorResponse(
        response,
        409,
        "The uploaded image could not be found in storage.",
      );
    }

    if (result.status === "INVALID_OBJECT") {
      return errorResponse(
        response,
        400,
        "The uploaded file is not a valid supported product image.",
      );
    }

    if (result.status === "IMAGE_LIMIT_REACHED") {
      return errorResponse(
        response,
        409,
        "This product already contains the maximum of 8 images.",
      );
    }

    if (result.status === "ALREADY_REGISTERED") {
      return successResponse(
        response,
        200,
        "Product image is already registered.",
        {
          image: result.image,
        },
      );
    }

    return successResponse(response, 201, "Product image added successfully.", {
      image: result.image,
    });
  } catch (error) {
    if (
      error instanceof AdminProductImageUploadValidationError ||
      error instanceof AdminProductValidationError
    ) {
      return errorResponse(response, error.statusCode, error.message);
    }

    return next(error);
  }
}
