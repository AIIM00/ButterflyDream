import { Prisma } from "@prisma/client";
import {
  cancelAdminOrder,
  getAdminOrderById,
  getAdminOrders,
  updateAdminOrderNote,
  updateAdminOrderPayment,
  updateAdminOrderStatus,
} from "../services/adminOrderService.js";
import {
  AdminOrderValidationError,
  parseAdminOrderCancelInput,
  parseAdminOrderId,
  parseAdminOrderNoteInput,
  parseAdminOrderPaymentInput,
  parseAdminOrderQuery,
  parseAdminOrderStatusInput,
} from "../utils/adminOrderValidation.js";

import {
  sendOrderCancelledEmailSafely,
  sendOrderStatusEmailSafely,
  sendPaymentStatusEmailSafely,
} from "../services/orderEmailService.js";

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

function requireAdminId(request, response) {
  const adminUserId = getAuthenticatedUserId(request);

  if (!adminUserId) {
    errorResponse(response, 401, "Authentication is required.");

    return null;
  }

  return adminUserId;
}

function handleAdminOrderFailure(result, response) {
  switch (result.status) {
    case "NOT_FOUND":
      return errorResponse(response, 404, "Order not found.");

    case "INVALID_TRANSITION":
      return errorResponse(
        response,
        409,
        `Order cannot move from ${result.currentStatus} to ${result.requestedStatus}.`,
        {
          currentStatus: result.currentStatus,

          requestedStatus: result.requestedStatus,

          allowedStatuses: result.allowedStatuses,
        },
      );

    case "CANNOT_CANCEL":
      return errorResponse(
        response,
        409,
        `An order with status ${result.currentStatus} cannot be cancelled.`,
        {
          currentStatus: result.currentStatus,
        },
      );

    case "INVALID_PAYMENT_TRANSITION":
      return errorResponse(
        response,
        409,
        `Payment cannot move from ${result.currentPaymentStatus} to ${result.requestedPaymentStatus}.`,
        {
          currentPaymentStatus: result.currentPaymentStatus,

          requestedPaymentStatus: result.requestedPaymentStatus,

          allowedPaymentStatuses: result.allowedPaymentStatuses,
        },
      );

    default:
      return null;
  }
}

function handleAdminOrderError(error, response, next) {
  if (error instanceof AdminOrderValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return errorResponse(response, 404, "Order not found.");
  }

  return next(error);
}

export async function listAdminOrders(request, response, next) {
  try {
    const adminUserId = requireAdminId(request, response);

    if (!adminUserId) {
      return undefined;
    }

    const query = parseAdminOrderQuery(request.query);

    const result = await getAdminOrders(query);

    return successResponse(
      response,
      200,
      "Orders retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleAdminOrderError(error, response, next);
  }
}

export async function getAdminOrder(request, response, next) {
  try {
    const adminUserId = requireAdminId(request, response);

    if (!adminUserId) {
      return undefined;
    }

    const orderId = parseAdminOrderId(request.params.orderId);

    const result = await getAdminOrderById(orderId);

    const failureResponse = handleAdminOrderFailure(result, response);

    if (failureResponse) {
      return failureResponse;
    }

    return successResponse(response, 200, "Order retrieved successfully.", {
      order: result.order,
    });
  } catch (error) {
    return handleAdminOrderError(error, response, next);
  }
}

export async function changeAdminOrderStatus(request, response, next) {
  try {
    const adminUserId = requireAdminId(request, response);

    if (!adminUserId) {
      return undefined;
    }

    const orderId = parseAdminOrderId(request.params.orderId);

    const input = parseAdminOrderStatusInput(request.body);

    const result = await updateAdminOrderStatus(adminUserId, orderId, input);

    const failureResponse = handleAdminOrderFailure(result, response);

    if (failureResponse) {
      return failureResponse;
    }

    // Send order status email asynchronously without blocking the response
    if (result.status === "UPDATED") {
      void sendOrderStatusEmailSafely(result.order, input.note);
    }

    return successResponse(
      response,
      200,
      result.status === "UNCHANGED"
        ? "Order already has this status."
        : "Order status updated successfully.",
      {
        order: result.order,
      },
    );
  } catch (error) {
    return handleAdminOrderError(error, response, next);
  }
}

export async function cancelOrder(request, response, next) {
  try {
    const adminUserId = requireAdminId(request, response);

    if (!adminUserId) {
      return undefined;
    }

    const orderId = parseAdminOrderId(request.params.orderId);

    const { reason } = parseAdminOrderCancelInput(request.body);

    const result = await cancelAdminOrder(adminUserId, orderId, reason);

    const failureResponse = handleAdminOrderFailure(result, response);

    if (failureResponse) {
      return failureResponse;
    }
    if (result.status === "CANCELLED") {
      void sendOrderCancelledEmailSafely(result.order);
    }

    return successResponse(
      response,
      200,
      result.status === "ALREADY_CANCELLED"
        ? "Order is already cancelled."
        : "Order cancelled successfully.",
      {
        order: result.order,
      },
    );
  } catch (error) {
    return handleAdminOrderError(error, response, next);
  }
}

export async function changeAdminOrderNote(request, response, next) {
  try {
    const adminUserId = requireAdminId(request, response);

    if (!adminUserId) {
      return undefined;
    }

    const orderId = parseAdminOrderId(request.params.orderId);

    const { adminNote } = parseAdminOrderNoteInput(request.body);

    const result = await updateAdminOrderNote(orderId, adminNote);

    const failureResponse = handleAdminOrderFailure(result, response);

    if (failureResponse) {
      return failureResponse;
    }

    return successResponse(response, 200, "Admin note updated successfully.", {
      order: result.order,
    });
  } catch (error) {
    return handleAdminOrderError(error, response, next);
  }
}

export async function changeAdminOrderPayment(request, response, next) {
  try {
    const adminUserId = requireAdminId(request, response);

    if (!adminUserId) {
      return undefined;
    }

    const orderId = parseAdminOrderId(request.params.orderId);

    const input = parseAdminOrderPaymentInput(request.body);

    const result = await updateAdminOrderPayment(orderId, input);

    const failureResponse = handleAdminOrderFailure(result, response);

    if (failureResponse) {
      return failureResponse;
    }
    if (result.status === "UPDATED") {
      void sendPaymentStatusEmailSafely(result.order, input.note);
    }

    return successResponse(
      response,
      200,
      result.status === "UNCHANGED"
        ? "Order already has this payment status."
        : "Payment status updated successfully.",
      {
        order: result.order,
      },
    );
  } catch (error) {
    return handleAdminOrderError(error, response, next);
  }
}
