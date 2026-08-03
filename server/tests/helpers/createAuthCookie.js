import authConfig from "../../config/authConfig.js";
import generateAuthToken from "../../utils/generateAuthToken.js";

export default function createAuthCookie(user) {
  const authenticationMethod =
    user.role === "ADMIN" ? "PASSWORD_EMAIL_OTP" : "PASSWORD";

  const token = generateAuthToken(user, {
    authenticationMethod,
  });

  return `${authConfig.cookieName}=${token}`;
}
