import { errorResponse } from "../utils/apiResponse.js";

function requireVerifiedEmail(request, response, next) {
  if (!request.user) {
    return errorResponse(response, 401, "Authentication is required.");
  }

  if (!request.user.emailVerifiedAt) {
    return errorResponse(
      response,
      403,
      "Please verify your email before continuing.",
    );
  }

  return next();
}

export default requireVerifiedEmail;
