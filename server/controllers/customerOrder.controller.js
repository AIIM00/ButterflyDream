import {
  getCustomerOrderById,
  getCustomerOrders,
} from "../services/customerOrderService.js";
import {
  CustomerOrderValidationError,
  parseCustomerOrderId,
  parseCustomerOrderQuery,
} from "../utils/customerOrderValidation.js";
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

function handleOrderError(error, response, next) {
  if (error instanceof CustomerOrderValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  return next(error);
}

export async function listCustomerOrders(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const query = parseCustomerOrderQuery(request.query);

    const result = await getCustomerOrders(userId, query);

    return successResponse(
      response,
      200,
      "Orders retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleOrderError(error, response, next);
  }
}

export async function getCustomerOrder(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const orderId = parseCustomerOrderId(request.params.orderId);

    const result = await getCustomerOrderById(userId, orderId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Order not found.");
    }

    return successResponse(response, 200, "Order retrieved successfully.", {
      order: result.order,
    });
  } catch (error) {
    return handleOrderError(error, response, next);
  }
}
