import {
  GuestCheckoutServiceError,
  placeCustomerManualOrder,
  placeGuestOrder,
  previewFlexibleCheckout,
} from "../services/guestCheckoutService.js";
import { sendOrderPlacedEmailSafely } from "../services/orderEmailService.js";
import {
  GuestCheckoutValidationError,
  parseCheckoutPreviewInput,
  parseCustomerManualOrderInput,
  parseGuestOrderInput,
} from "../utils/guestCheckoutValidation.js";
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

function handleGuestCheckoutError(error, response, next) {
  if (error instanceof GuestCheckoutValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  if (error instanceof GuestCheckoutServiceError) {
    switch (error.code) {
      case "CART_EMPTY":
        return errorResponse(response, 400, error.message, error.data);
      case "CUSTOMER_UNAVAILABLE":
        return errorResponse(response, 403, error.message, error.data);
      case "ORDERS_DISABLED":
      case "DELIVERY_GOVERNORATE_UNAVAILABLE":
      case "UNAVAILABLE_ITEMS":
      case "INSUFFICIENT_STOCK":
      case "TRANSACTION_CONFLICT":
        return errorResponse(response, 409, error.message, error.data);
      default:
        break;
    }
  }

  return next(error);
}

export async function previewCheckout(request, response, next) {
  try {
    const input = parseCheckoutPreviewInput(request.body);
    const checkout = await previewFlexibleCheckout(input);

    return successResponse(response, 200, "Checkout preview retrieved.", {
      checkout,
    });
  } catch (error) {
    return handleGuestCheckoutError(error, response, next);
  }
}

export async function createGuestOrder(request, response, next) {
  try {
    const input = parseGuestOrderInput(request.body);
    const order = await placeGuestOrder(input);

    void sendOrderPlacedEmailSafely(order);

    return successResponse(response, 201, "Order placed successfully.", {
      order,
      checkoutMode: "GUEST",
    });
  } catch (error) {
    return handleGuestCheckoutError(error, response, next);
  }
}

export async function createCustomerManualOrder(request, response, next) {
  try {
    const userId = getAuthenticatedUserId(request);

    if (!userId) {
      return errorResponse(response, 401, "Authentication is required.");
    }

    const input = parseCustomerManualOrderInput(request.body);
    const order = await placeCustomerManualOrder(userId, input);

    void sendOrderPlacedEmailSafely(order);

    return successResponse(response, 201, "Order placed successfully.", {
      order,
      checkoutMode: "CUSTOMER_MANUAL_ADDRESS",
    });
  } catch (error) {
    return handleGuestCheckoutError(error, response, next);
  }
}
