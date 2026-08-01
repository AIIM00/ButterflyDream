import { getAdminDashboard } from "../services/adminDashboardService.js";
import {
  AdminDashboardValidationError,
  parseAdminDashboardQuery,
} from "../utils/adminDashboardValidation.js";
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

export async function getDashboard(request, response, next) {
  try {
    if (!requireAdminId(request, response)) {
      return undefined;
    }

    const { period } = parseAdminDashboardQuery(request.query);

    const dashboard = await getAdminDashboard(period);

    return successResponse(response, 200, "Dashboard retrieved successfully.", {
      dashboard,
    });
  } catch (error) {
    if (error instanceof AdminDashboardValidationError) {
      return errorResponse(response, error.statusCode, error.message);
    }

    return next(error);
  }
}
