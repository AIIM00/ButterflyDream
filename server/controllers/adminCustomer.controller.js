import { getAdminCustomers } from "../services/adminCustomerService.js";
import {
  AdminCustomerValidationError,
  parseAdminCustomerQuery,
} from "../utils/adminCustomerValidation.js";
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

export async function listAdminCustomers(request, response, next) {
  try {
    if (!requireAdminId(request, response)) {
      return undefined;
    }

    const query = parseAdminCustomerQuery(request.query);
    const result = await getAdminCustomers(query);

    return successResponse(
      response,
      200,
      "Customers retrieved successfully.",
      result,
    );
  } catch (error) {
    if (error instanceof AdminCustomerValidationError) {
      return errorResponse(response, error.statusCode, error.message);
    }

    return next(error);
  }
}
