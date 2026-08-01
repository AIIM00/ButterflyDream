import { Prisma } from "@prisma/client";
import {
  CheckoutServiceError,
  getCustomerCheckout,
  placeCustomerOrder,
} from "../services/checkoutService.js";
import {
  CheckoutValidationError,
  parsePlaceOrderInput,
} from "../utils/checkoutValidation.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

import { sendOrderPlacedEmailSafely } from "../services/orderEmailService.js";

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

function handleCheckoutServiceError(error, response) {
  switch (error.code) {
    case "ADDRESS_NOT_FOUND":
      return errorResponse(response, 404, error.message);

    case "CART_EMPTY":
      return errorResponse(response, 400, error.message);

    case "CUSTOMER_UNAVAILABLE":
      return errorResponse(response, 403, error.message);

    case "ORDERS_DISABLED":
      return errorResponse(response, 409, error.message);

    case "PRICE_CHANGED":
      return errorResponse(response, 409, error.message, error.data);

    case "UNAVAILABLE_ITEMS":
      return errorResponse(response, 409, error.message, error.data);

    case "INSUFFICIENT_STOCK":
      return errorResponse(response, 409, error.message, error.data);

    case "TRANSACTION_CONFLICT":
      return errorResponse(response, 409, error.message);

    default:
      return null;
  }
}

function handleCheckoutError(error, response, next) {
  if (error instanceof CheckoutValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  if (error instanceof CheckoutServiceError) {
    const serviceResponse = handleCheckoutServiceError(error, response);

    if (serviceResponse) {
      return serviceResponse;
    }
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return errorResponse(
      response,
      404,
      "The requested checkout resource was not found.",
    );
  }

  return next(error);
}

export async function getCheckout(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const checkout = await getCustomerCheckout(userId);

    return successResponse(response, 200, "Checkout retrieved successfully.", {
      checkout,
    });
  } catch (error) {
    return handleCheckoutError(error, response, next);
  }
}

export async function createCheckoutOrder(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const input = parsePlaceOrderInput(request.body);

    const result = await placeCustomerOrder(userId, input);

    // Send order placed email asynchronously without blocking the response
    void sendOrderPlacedEmailSafely(result.order);
    return successResponse(response, 201, "Order placed successfully.", {
      order: result.order,
    });
  } catch (error) {
    return handleCheckoutError(error, response, next);
  }
}
