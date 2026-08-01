import authConfig from "../config/authConfig.js";

function clearAuthCookie(response) {
  if (!response || typeof response.clearCookie !== "function") {
    throw new TypeError(
      "clearAuthCookie requires a valid Express response object.",
    );
  }

  response.clearCookie(authConfig.cookieName, authConfig.clearCookieOptions);
}

export default clearAuthCookie;
