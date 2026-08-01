import {
  getAdminStoreSetting,
  updateAdminStoreSetting,
} from "../services/adminStoreSettingService.js";
import {
  AdminStoreSettingValidationError,
  parseAdminStoreSettingInput,
} from "../utils/adminStoreSettingValidation.js";
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

export async function getStoreSetting(request, response, next) {
  try {
    if (!requireAdminId(request, response)) {
      return undefined;
    }

    const setting = await getAdminStoreSetting();

    return successResponse(
      response,
      200,
      "Store settings retrieved successfully.",
      {
        setting,
      },
    );
  } catch (error) {
    return next(error);
  }
}

export async function updateStoreSetting(request, response, next) {
  try {
    if (!requireAdminId(request, response)) {
      return undefined;
    }

    const input = parseAdminStoreSettingInput(request.body);

    const setting = await updateAdminStoreSetting(input);

    return successResponse(
      response,
      200,
      "Store settings updated successfully.",
      {
        setting,
      },
    );
  } catch (error) {
    if (error instanceof AdminStoreSettingValidationError) {
      return errorResponse(response, error.statusCode, error.message);
    }

    return next(error);
  }
}
