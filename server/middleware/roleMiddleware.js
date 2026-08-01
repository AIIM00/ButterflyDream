import { errorResponse } from "../utils/apiResponse.js";

const systemRoles = new Set(["CUSTOMER", "ADMIN"]);

function requireRole(...allowedRoles) {
  if (allowedRoles.length === 0) {
    throw new Error("requireRole must receive at least one allowed role.");
  }

  for (const role of allowedRoles) {
    if (!systemRoles.has(role)) {
      throw new Error(`Invalid role passed to requireRole: ${role}`);
    }
  }

  const allowedRoleSet = new Set(allowedRoles);

  return function roleMiddleware(request, response, next) {
    if (!request.user) {
      return errorResponse(response, 401, "Authentication is required.");
    }

    if (!allowedRoleSet.has(request.user.role)) {
      return errorResponse(
        response,
        403,
        "You do not have permission to access this resource.",
      );
    }

    return next();
  };
}

export default requireRole;
