import { Prisma } from "@prisma/client";
import {
  addCustomerCartItem,
  clearCustomerCart,
  getCustomerCart,
  refreshCustomerCartPrices,
  removeCustomerCartItem,
  updateCustomerCartItem,
} from "../services/cartService.js";
import {
  CartValidationError,
  parseAddCartItemInput,
  parseCartItemId,
  parseUpdateCartItemInput,
} from "../utils/cartValidation.js";
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

function handleCartError(error, response, next) {
  if (error instanceof CartValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return errorResponse(
      response,
      404,
      "The requested cart resource was not found.",
    );
  }

  return next(error);
}

function handleCartServiceFailure(result, response) {
  switch (result.status) {
    case "VARIANT_NOT_FOUND":
      return errorResponse(response, 404, "Product variant not found.");

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

    case "VARIANT_UNAVAILABLE":
      return errorResponse(
        response,
        409,
        "This product option is not currently available.",
      );

    case "OUT_OF_STOCK":
      return errorResponse(
        response,
        409,
        "This product option is out of stock.",
        {
          availableStock: result.availableStock ?? 0,
        },
      );

    case "INSUFFICIENT_STOCK":
      return errorResponse(
        response,
        409,
        "The requested quantity exceeds the available stock.",
        {
          availableStock: result.availableStock ?? 0,
        },
      );

    case "QUANTITY_LIMIT":
      return errorResponse(
        response,
        400,
        `A cart item cannot exceed ${result.maximumQuantity} units.`,
        {
          maximumQuantity: result.maximumQuantity,
        },
      );

    case "ITEM_NOT_FOUND":
      return errorResponse(response, 404, "Cart item not found.");

    default:
      return null;
  }
}

export async function getCart(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const cart = await getCustomerCart(userId);

    return successResponse(response, 200, "Cart retrieved successfully.", {
      cart,
    });
  } catch (error) {
    return handleCartError(error, response, next);
  }
}

export async function addCartItem(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const input = parseAddCartItemInput(request.body);

    const result = await addCustomerCartItem(userId, input);

    const failureResponse = handleCartServiceFailure(result, response);

    if (failureResponse) {
      return failureResponse;
    }

    return successResponse(
      response,
      200,
      "Product added to cart successfully.",
      {
        cart: result.cart,
      },
    );
  } catch (error) {
    return handleCartError(error, response, next);
  }
}

export async function updateCartItem(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const cartItemId = parseCartItemId(request.params.cartItemId);

    const { quantity } = parseUpdateCartItemInput(request.body);

    const result = await updateCustomerCartItem(userId, cartItemId, quantity);

    const failureResponse = handleCartServiceFailure(result, response);

    if (failureResponse) {
      return failureResponse;
    }

    return successResponse(response, 200, "Cart item updated successfully.", {
      cart: result.cart,
    });
  } catch (error) {
    return handleCartError(error, response, next);
  }
}

export async function removeCartItem(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const cartItemId = parseCartItemId(request.params.cartItemId);

    const result = await removeCustomerCartItem(userId, cartItemId);

    const failureResponse = handleCartServiceFailure(result, response);

    if (failureResponse) {
      return failureResponse;
    }

    return successResponse(response, 200, "Cart item removed successfully.", {
      cart: result.cart,
    });
  } catch (error) {
    return handleCartError(error, response, next);
  }
}

export async function clearCart(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const result = await clearCustomerCart(userId);

    return successResponse(response, 200, "Cart cleared successfully.", {
      cart: result.cart,
    });
  } catch (error) {
    return handleCartError(error, response, next);
  }
}

export async function refreshCartPrices(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const result = await refreshCustomerCartPrices(userId);

    return successResponse(
      response,
      200,
      "Cart prices refreshed successfully.",
      {
        cart: result.cart,
      },
    );
  } catch (error) {
    return handleCartError(error, response, next);
  }
}
