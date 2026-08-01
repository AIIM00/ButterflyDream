import jwt from "jsonwebtoken";
import adminLoginConfig from "../config/adminLoginConfig.js";
import authConfig from "../config/authConfig.js";

const CHALLENGE_TYPE = "ADMIN_LOGIN_CHALLENGE";

export function generateAdminLoginChallengeToken({ userId, otpId }) {
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new TypeError("A valid admin user ID is required.");
  }

  if (typeof otpId !== "string" || otpId.trim().length === 0) {
    throw new TypeError("A valid OTP ID is required.");
  }

  return jwt.sign(
    {
      type: CHALLENGE_TYPE,
    },
    authConfig.jwtSecret,
    {
      algorithm: authConfig.jwtAlgorithm,

      subject: userId,
      jwtid: otpId,

      expiresIn: adminLoginConfig.challengeTokenExpiresIn,

      issuer: adminLoginConfig.challengeIssuer,

      audience: adminLoginConfig.challengeAudience,
    },
  );
}

export function verifyAdminLoginChallengeToken(token) {
  const payload = jwt.verify(token, authConfig.jwtSecret, {
    algorithms: [authConfig.jwtAlgorithm],

    issuer: adminLoginConfig.challengeIssuer,

    audience: adminLoginConfig.challengeAudience,
  });

  const isValidPayload =
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    payload.type === CHALLENGE_TYPE &&
    typeof payload.sub === "string" &&
    payload.sub.length > 0 &&
    typeof payload.jti === "string" &&
    payload.jti.length > 0;

  if (!isValidPayload) {
    throw new jwt.JsonWebTokenError("Invalid admin login challenge.");
  }

  return {
    userId: payload.sub,
    otpId: payload.jti,
  };
}

export function getAdminLoginChallengeToken(request) {
  const token = request.cookies?.[adminLoginConfig.challengeCookieName];

  if (typeof token !== "string" || token.trim().length === 0) {
    return null;
  }

  return token;
}

export function setAdminLoginChallengeCookie(response, challengeToken) {
  response.cookie(
    adminLoginConfig.challengeCookieName,

    challengeToken,

    adminLoginConfig.challengeCookieOptions,
  );
}

export function clearAdminLoginChallengeCookie(response) {
  response.clearCookie(
    adminLoginConfig.challengeCookieName,

    adminLoginConfig.clearChallengeCookieOptions,
  );
}
