import {
  AdminCategoryImageUploadValidationError,
  parseCategoryImageFinalizeRequest,
  parseCategoryImageUploadRequest,
} from "../utils/adminCategoryImageUploadValidation.js";

import {
  CategoryValidationError,
  parseCategoryId,
} from "../utils/categoryValidation.js";

import { errorResponse, successResponse } from "../utils/apiResponse.js";

import { createCategoryImageUploadUrl as createCategoryImageUploadUrlService } from "../services/r2CategoryImageUploadService.js";

import { finalizeCategoryImageUpload as finalizeCategoryImageUploadService } from "../services/r2CategoryImageFinalizeService.js";

export async function createCategoryImageUploadUrl(request, response, next) {
  try {
    const categoryId = parseCategoryId(request.params.categoryId);

    const input = parseCategoryImageUploadRequest(request.body);

    const result = await createCategoryImageUploadUrlService(categoryId, input);

    if (result.status === "CATEGORY_NOT_FOUND") {
      return errorResponse(response, 404, "Category not found.");
    }

    return successResponse(
      response,
      200,
      "Category image upload URL created successfully.",
      {
        upload: result.upload,
      },
    );
  } catch (error) {
    if (
      error instanceof AdminCategoryImageUploadValidationError ||
      error instanceof CategoryValidationError
    ) {
      return errorResponse(response, error.statusCode, error.message);
    }

    return next(error);
  }
}

export async function finalizeCategoryImageUpload(request, response, next) {
  try {
    const categoryId = parseCategoryId(request.params.categoryId);

    const input = parseCategoryImageFinalizeRequest(request.body);

    const result = await finalizeCategoryImageUploadService(categoryId, input);

    if (result.status === "CATEGORY_NOT_FOUND") {
      return errorResponse(response, 404, "Category not found.");
    }

    if (result.status === "INVALID_OBJECT_KEY") {
      return errorResponse(
        response,
        400,
        "The uploaded image does not belong to this category.",
      );
    }

    if (result.status === "OBJECT_NOT_FOUND") {
      return errorResponse(
        response,
        409,
        "The uploaded category image could not be found in storage.",
      );
    }

    if (result.status === "INVALID_OBJECT") {
      return errorResponse(
        response,
        400,
        "The uploaded file is not a valid supported category image.",
      );
    }

    if (result.status === "ALREADY_REGISTERED") {
      return successResponse(
        response,
        200,
        "Category image is already registered.",
        {
          category: result.category,
        },
      );
    }

    return successResponse(
      response,
      201,
      "Category image updated successfully.",
      {
        category: result.category,
      },
    );
  } catch (error) {
    if (
      error instanceof AdminCategoryImageUploadValidationError ||
      error instanceof CategoryValidationError
    ) {
      return errorResponse(response, error.statusCode, error.message);
    }

    return next(error);
  }
}
