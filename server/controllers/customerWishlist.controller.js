import {
  addCustomerWishlistItem,
  getCustomerWishlist,
  removeCustomerWishlistItem,
} from "../services/customerWishlistService.js";
import {
  CustomerWishlistValidationError,
  parseAddWishlistItemInput,
  parseWishlistProductId,
} from "../utils/customerWishlistValidation.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

function getAuthenticatedUserId(request) {
  return (
    request.user?.id ??
    request.user?.userId ??
    request.auth?.userId ??
    request.userId ??
    null
  );
}

function requireCustomerId(request, response) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    errorResponse(response, 401, "Authentication is required.");

    return null;
  }

  return userId;
}

function handleWishlistError(error, response, next) {
  if (error instanceof CustomerWishlistValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  return next(error);
}

function handleWishlistFailure(result, response) {
  switch (result.status) {
    case "PRODUCT_NOT_FOUND":
      return errorResponse(response, 404, "Product not found.");

    case "PRODUCT_UNAVAILABLE":
      return errorResponse(
        response,
        409,
        "This product is not currently available.",
      );

    case "CATEGORY_UNAVAILABLE":
      return errorResponse(
        response,
        409,
        "This product category is not currently available.",
      );

    case "NO_ACTIVE_VARIANTS":
      return errorResponse(
        response,
        409,
        "This product does not have an available option.",
      );

    case "NOT_SAVED":
      return errorResponse(
        response,
        404,
        "This product is not saved in your wishlist.",
      );

    default:
      return null;
  }
}

export async function listCustomerWishlist(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const wishlist = await getCustomerWishlist(userId);

    return successResponse(response, 200, "Wishlist retrieved successfully.", {
      wishlist,
    });
  } catch (error) {
    return handleWishlistError(error, response, next);
  }
}

export async function addWishlistItem(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const { productId } = parseAddWishlistItemInput(request.body);

    const result = await addCustomerWishlistItem(userId, productId);

    const failureResponse = handleWishlistFailure(result, response);

    if (failureResponse) {
      return failureResponse;
    }

    if (result.status === "ALREADY_SAVED") {
      return successResponse(
        response,
        200,
        "Product is already saved in your wishlist.",
        {
          wishlist: result.wishlist,
        },
      );
    }

    return successResponse(
      response,
      201,
      "Product added to wishlist successfully.",
      {
        wishlist: result.wishlist,
      },
    );
  } catch (error) {
    return handleWishlistError(error, response, next);
  }
}

export async function removeWishlistItem(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const productId = parseWishlistProductId(request.params.productId);

    const result = await removeCustomerWishlistItem(userId, productId);

    const failureResponse = handleWishlistFailure(result, response);

    if (failureResponse) {
      return failureResponse;
    }

    return successResponse(
      response,
      200,
      "Product removed from wishlist successfully.",
      {
        wishlist: result.wishlist,
      },
    );
  } catch (error) {
    return handleWishlistError(error, response, next);
  }
}
