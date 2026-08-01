import authConfig from "../config/authConfig.js";

function setAuthCookie(response, token) {
  if (!response || typeof response.cookie !== "function") {
    throw new TypeError(
      "setAuthCookie requires a valid Express response object.",
    );
  }

  if (typeof token !== "string" || token.trim().length === 0) {
    throw new TypeError("setAuthCookie requires a valid authentication token.");
  }

  response.cookie(authConfig.cookieName, token, authConfig.cookieOptions);
}

export default setAuthCookie;
