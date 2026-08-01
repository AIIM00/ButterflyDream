import {
  deleteCustomerNotification,
  deleteReadCustomerNotifications,
  getCustomerNotifications,
  getCustomerUnreadNotificationCount,
  markAllCustomerNotificationsAsRead,
  markCustomerNotificationAsRead,
} from "../services/customerNotificationService.js";
import {
  CustomerNotificationValidationError,
  parseCustomerNotificationId,
  parseCustomerNotificationQuery,
} from "../utils/customerNotificationValidation.js";
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

function handleNotificationError(error, response, next) {
  if (error instanceof CustomerNotificationValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  return next(error);
}

export async function listCustomerNotifications(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const query = parseCustomerNotificationQuery(request.query);

    const result = await getCustomerNotifications(userId, query);

    return successResponse(
      response,
      200,
      "Notifications retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleNotificationError(error, response, next);
  }
}

export async function getUnreadNotificationCount(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const result = await getCustomerUnreadNotificationCount(userId);

    return successResponse(
      response,
      200,
      "Unread notification count retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleNotificationError(error, response, next);
  }
}

export async function readNotification(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const notificationId = parseCustomerNotificationId(
      request.params.notificationId,
    );

    const result = await markCustomerNotificationAsRead(userId, notificationId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Notification not found.");
    }

    return successResponse(
      response,
      200,
      result.status === "ALREADY_READ"
        ? "Notification is already read."
        : "Notification marked as read.",
      {
        notification: result.notification,

        unreadCount: result.unreadCount,
      },
    );
  } catch (error) {
    return handleNotificationError(error, response, next);
  }
}

export async function readAllNotifications(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const result = await markAllCustomerNotificationsAsRead(userId);

    return successResponse(
      response,
      200,
      "All notifications marked as read.",
      result,
    );
  } catch (error) {
    return handleNotificationError(error, response, next);
  }
}

export async function removeNotification(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const notificationId = parseCustomerNotificationId(
      request.params.notificationId,
    );

    const result = await deleteCustomerNotification(userId, notificationId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Notification not found.");
    }

    return successResponse(
      response,
      200,
      "Notification deleted successfully.",
      {
        unreadCount: result.unreadCount,
      },
    );
  } catch (error) {
    return handleNotificationError(error, response, next);
  }
}

export async function removeReadNotifications(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const result = await deleteReadCustomerNotifications(userId);

    return successResponse(
      response,
      200,
      result.deletedCount === 1
        ? "One read notification was deleted."
        : `${result.deletedCount} read notifications were deleted.`,
      result,
    );
  } catch (error) {
    return handleNotificationError(error, response, next);
  }
}
