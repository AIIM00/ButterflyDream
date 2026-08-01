import {
  changeCustomerPassword,
  getCustomerProfile,
  updateCustomerProfile,
} from "../services/customerProfileService.js";
import {
  CustomerProfileValidationError,
  parseCustomerPasswordInput,
  parseCustomerProfileInput,
} from "../utils/customerProfileValidation.js";
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

function handleProfileError(error, response, next) {
  if (error instanceof CustomerProfileValidationError) {
    return errorResponse(response, error.statusCode, error.message);
  }

  return next(error);
}

export async function getProfile(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const result = await getCustomerProfile(userId);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Customer account not found.");
    }

    return successResponse(response, 200, "Profile retrieved successfully.", {
      profile: result.profile,
    });
  } catch (error) {
    return handleProfileError(error, response, next);
  }
}

export async function updateProfile(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const input = parseCustomerProfileInput(request.body);

    const result = await updateCustomerProfile(userId, input);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Customer account not found.");
    }

    return successResponse(response, 200, "Profile updated successfully.", {
      profile: result.profile,
    });
  } catch (error) {
    return handleProfileError(error, response, next);
  }
}

export async function changePassword(request, response, next) {
  try {
    const userId = requireCustomerId(request, response);

    if (!userId) {
      return undefined;
    }

    const input = parseCustomerPasswordInput(request.body);

    const result = await changeCustomerPassword(userId, input);

    if (result.status === "NOT_FOUND") {
      return errorResponse(response, 404, "Customer account not found.");
    }

    if (result.status === "INVALID_CURRENT_PASSWORD") {
      return errorResponse(response, 400, "Current password is incorrect.");
    }

    if (result.status === "PASSWORD_REUSED") {
      return errorResponse(
        response,
        400,
        "New password must be different from the current password.",
      );
    }

    return successResponse(
      response,
      200,
      "Password changed successfully. Please sign in again.",
      {
        requiresReauthentication: true,
      },
    );
  } catch (error) {
    return handleProfileError(error, response, next);
  }
}
