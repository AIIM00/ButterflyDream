import {
  getAdminDeliveryGovernorates,
  updateAdminDeliveryGovernorate,
} from "../services/adminDeliveryGovernorateService.js";

import {
  AdminDeliveryGovernorateValidationError,
  parseAdminDeliveryGovernorateId,
  parseAdminDeliveryGovernorateUpdateInput,
} from "../utils/adminDeliveryGovernorateValidation.js";

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

export async function listDeliveryGovernorates(request, response, next) {
  try {
    if (!requireAdminId(request, response)) {
      return undefined;
    }

    const governorates = await getAdminDeliveryGovernorates();

    return successResponse(
      response,
      200,
      "Delivery governorates retrieved successfully.",
      {
        governorates,
      },
    );
  } catch (error) {
    return next(error);
  }
}

export async function updateDeliveryGovernorate(request, response, next) {
  try {
    if (!requireAdminId(request, response)) {
      return undefined;
    }

    const governorateId = parseAdminDeliveryGovernorateId(
      request.params.governorateId,
    );

    const input = parseAdminDeliveryGovernorateUpdateInput(request.body);

    const result = await updateAdminDeliveryGovernorate(governorateId, input);

    if (result.status === "NOT_FOUND") {
      return errorResponse(
        response,
        404,
        "Delivery governorate was not found.",
      );
    }

    return successResponse(
      response,
      200,
      "Delivery governorate updated successfully.",
      {
        governorate: result.governorate,
      },
    );
  } catch (error) {
    if (error instanceof AdminDeliveryGovernorateValidationError) {
      return errorResponse(response, error.statusCode, error.message);
    }

    return next(error);
  }
}
