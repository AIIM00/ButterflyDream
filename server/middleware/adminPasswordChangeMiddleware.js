import { errorResponse } from "../utils/apiResponse.js";

function requireCompletedAdminPasswordChange(request, response, next) {
  if (request.user?.role !== "ADMIN") {
    return errorResponse(response, 403, "Administrator access is required.");
  }

  if (request.user.mustChangePassword) {
    return errorResponse(
      response,
      403,
      "You must change the temporary administrator password before continuing.",
      {
        code: "ADMIN_PASSWORD_CHANGE_REQUIRED",
      },
    );
  }

  return next();
}

export default requireCompletedAdminPasswordChange;
