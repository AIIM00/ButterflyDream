import authConfig from "../../config/authConfig.js";
import generateAuthToken from "../../utils/generateAuthToken.js";

export default function createAuthCookie(user) {
  const token = generateAuthToken(user, {
    authenticationMethod: "PASSWORD",
  });

  return `${authConfig.cookieName}=${token}`;
}
