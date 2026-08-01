import { errorResponse, successResponse } from "../utils/apiResponse.js";
import {
  CatalogQueryError,
  parseProductCatalogQuery,
  parseProductSlug,
} from "../utils/catalogQuery.js";
import {
  getPublicCategories,
  getPublicProductBySlug,
  getPublicProducts,
} from "../services/catalogService.js";

function handleCatalogError(error, response, next) {
  if (error instanceof CatalogQueryError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  return next(error);
}

export async function listPublicCategories(_request, response, next) {
  try {
    const categories = await getPublicCategories();

    return successResponse(
      response,
      200,
      "Categories retrieved successfully.",
      {
        categories,
      },
    );
  } catch (error) {
    return handleCatalogError(error, response, next);
  }
}

export async function listPublicProducts(request, response, next) {
  try {
    const filters = parseProductCatalogQuery(request.query);

    const result = await getPublicProducts(filters);

    return successResponse(
      response,
      200,
      "Products retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleCatalogError(error, response, next);
  }
}

export async function getPublicProduct(request, response, next) {
  try {
    const slug = parseProductSlug(request.params.slug);

    const product = await getPublicProductBySlug(slug);

    if (!product) {
      return errorResponse(response, 404, "Product not found.");
    }

    return successResponse(response, 200, "Product retrieved successfully.", {
      product,
    });
  } catch (error) {
    return handleCatalogError(error, response, next);
  }
}
