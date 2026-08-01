import jwt from "jsonwebtoken";
import authConfig from "../config/authConfig.js";
import passwordResetConfig from "../config/passwordResetConfig.js";

const CHALLENGE_TYPE = "PASSWORD_RESET_CHALLENGE";

export function generatePasswordResetChallengeToken({ userId, otpId }) {
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new TypeError("A valid user ID is required.");
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

      expiresIn: passwordResetConfig.challengeTokenExpiresIn,

      issuer: passwordResetConfig.challengeIssuer,

      audience: passwordResetConfig.challengeAudience,
    },
  );
}

export function verifyPasswordResetChallengeToken(token) {
  const payload = jwt.verify(token, authConfig.jwtSecret, {
    algorithms: [authConfig.jwtAlgorithm],

    issuer: passwordResetConfig.challengeIssuer,

    audience: passwordResetConfig.challengeAudience,
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
    throw new jwt.JsonWebTokenError("Invalid password-reset challenge.");
  }

  return {
    userId: payload.sub,
    otpId: payload.jti,
  };
}

export function getPasswordResetChallengeToken(request) {
  const token = request.cookies?.[passwordResetConfig.challengeCookieName];

  if (typeof token !== "string" || token.trim().length === 0) {
    return null;
  }

  return token;
}

export function setPasswordResetChallengeCookie(response, challengeToken) {
  response.cookie(
    passwordResetConfig.challengeCookieName,

    challengeToken,

    passwordResetConfig.challengeCookieOptions,
  );
}

export function clearPasswordResetChallengeCookie(response) {
  response.clearCookie(
    passwordResetConfig.challengeCookieName,

    passwordResetConfig.clearChallengeCookieOptions,
  );
}
