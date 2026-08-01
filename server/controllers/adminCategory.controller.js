import { Prisma } from "@prisma/client";
import {
  createAdminCategory,
  listAdminCategories,
  reorderAdminCategories,
  updateAdminCategory,
  updateAdminCategoryStatus,
} from "../services/adminCategoryService.js";
import {
  CategoryValidationError,
  parseCategoryId,
  parseCategoryReorderInput,
  parseCategoryStatusInput,
  parseCreateCategoryInput,
  parseUpdateCategoryInput,
} from "../utils/categoryValidation.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

function handleCategoryError(error, response, next) {
  if (error instanceof CategoryValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return errorResponse(
      response,
      409,
      "A category with this name or slug already exists.",
    );
  }

  return next(error);
}

export async function getAdminCategories(_request, response, next) {
  try {
    const categories = await listAdminCategories();

    return successResponse(
      response,
      200,
      "Admin categories retrieved successfully.",
      {
        categories,
      },
    );
  } catch (error) {
    return handleCategoryError(error, response, next);
  }
}

export async function createCategory(request, response, next) {
  try {
    const input = parseCreateCategoryInput(request.body);

    const category = await createAdminCategory(input);

    return successResponse(response, 201, "Category created successfully.", {
      category,
    });
  } catch (error) {
    return handleCategoryError(error, response, next);
  }
}

export async function updateCategory(request, response, next) {
  try {
    const categoryId = parseCategoryId(request.params.categoryId);

    const input = parseUpdateCategoryInput(request.body);

    const category = await updateAdminCategory(categoryId, input);

    if (!category) {
      return errorResponse(response, 404, "Category not found.");
    }

    return successResponse(response, 200, "Category updated successfully.", {
      category,
    });
  } catch (error) {
    return handleCategoryError(error, response, next);
  }
}

export async function updateCategoryStatus(request, response, next) {
  try {
    const categoryId = parseCategoryId(request.params.categoryId);

    const input = parseCategoryStatusInput(request.body);

    const result = await updateAdminCategoryStatus(categoryId, input);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Category not found.");
    }

    if (result.status === "CONFIRMATION_REQUIRED") {
      return errorResponse(
        response,
        409,
        "This category contains active products. Deactivating it will hide those products from the public catalog. Send confirmHideProducts=true to continue.",
        {
          category: result.category,
          requiresConfirmation: true,
        },
      );
    }

    return successResponse(
      response,
      200,
      result.category.isActive
        ? "Category activated successfully."
        : "Category deactivated successfully.",
      {
        category: result.category,
      },
    );
  } catch (error) {
    return handleCategoryError(error, response, next);
  }
}

export async function reorderCategories(request, response, next) {
  try {
    const { categoryIds } = parseCategoryReorderInput(request.body);

    const result = await reorderAdminCategories(categoryIds);

    if (result.status === "INCOMPLETE_CATEGORY_LIST") {
      return errorResponse(
        response,
        400,
        "The reorder request must contain every category exactly once.",
      );
    }

    if (result.status === "UNKNOWN_CATEGORY") {
      return errorResponse(
        response,
        400,
        "The reorder request contains an unknown category ID.",
      );
    }

    return successResponse(
      response,
      200,
      "Categories reordered successfully.",
      {
        categories: result.categories,
      },
    );
  } catch (error) {
    return handleCategoryError(error, response, next);
  }
}
