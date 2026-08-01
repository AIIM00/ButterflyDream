import {
  createHmac,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import prisma from "../src/prisma.js";

const OTP_LENGTH = 6;
const OTP_PATTERN = /^\d{6}$/;

const otpHashSecret = process.env.OTP_HASH_SECRET?.trim();

if (!otpHashSecret) {
  throw new Error(
    "OTP_HASH_SECRET is missing. Add it to the server .env file.",
  );
}

if (otpHashSecret.length < 64) {
  throw new Error("OTP_HASH_SECRET must contain at least 64 characters.");
}

function generateNumericOtp() {
  return randomInt(0, 1_000_000).toString().padStart(OTP_LENGTH, "0");
}

function createOtpHash({ otpId, userId, purpose, code }) {
  return createHmac("sha256", otpHashSecret)
    .update(`${otpId}:${userId}:${purpose}:${code}`)
    .digest("hex");
}

function hashesMatch(firstHash, secondHash) {
  const firstBuffer = Buffer.from(firstHash, "hex");

  const secondBuffer = Buffer.from(secondHash, "hex");

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return timingSafeEqual(firstBuffer, secondBuffer);
}

export async function createOtpCode({ userId, purpose, expiresInMinutes }) {
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new TypeError("A valid user ID is required.");
  }

  if (typeof purpose !== "string" || purpose.trim().length === 0) {
    throw new TypeError("A valid OTP purpose is required.");
  }

  if (!Number.isInteger(expiresInMinutes) || expiresInMinutes < 1) {
    throw new TypeError("OTP expiration must be a positive integer.");
  }

  const otpId = randomUUID();
  const code = generateNumericOtp();
  const now = new Date();

  const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

  const codeHash = createOtpHash({
    otpId,
    userId,
    purpose,
    code,
  });

  const [, otpRecord] = await prisma.$transaction([
    prisma.otpCode.updateMany({
      where: {
        userId,
        purpose,
        usedAt: null,
      },

      data: {
        usedAt: now,
      },
    }),

    prisma.otpCode.create({
      data: {
        id: otpId,
        userId,
        purpose,
        codeHash,
        expiresAt,
      },
    }),
  ]);

  return {
    code,
    otpRecord,
  };
}

export async function invalidateOtpCode(otpId, database = prisma) {
  if (typeof otpId !== "string" || otpId.trim().length === 0) {
    return;
  }

  await database.otpCode.updateMany({
    where: {
      id: otpId,
      usedAt: null,
    },

    data: {
      usedAt: new Date(),
    },
  });
}

export async function verifyAndConsumeOtpCode({
  otpId,
  userId,
  purpose,
  code,
  maxAttempts,
  database = prisma,
}) {
  if (typeof code !== "string" || !OTP_PATTERN.test(code)) {
    return {
      status: "INVALID_FORMAT",
    };
  }

  const otpRecord = await database.otpCode.findUnique({
    where: {
      id: otpId,
    },
  });

  if (
    !otpRecord ||
    otpRecord.userId !== userId ||
    otpRecord.purpose !== purpose
  ) {
    return {
      status: "INVALID",
    };
  }

  if (otpRecord.usedAt !== null) {
    return {
      status: "USED",
    };
  }

  const now = new Date();

  if (otpRecord.expiresAt <= now) {
    await invalidateOtpCode(otpRecord.id, database);

    return {
      status: "EXPIRED",
    };
  }

  if (otpRecord.attemptCount >= maxAttempts) {
    await invalidateOtpCode(otpRecord.id, database);

    return {
      status: "TOO_MANY_ATTEMPTS",
    };
  }

  const submittedCodeHash = createOtpHash({
    otpId: otpRecord.id,
    userId,
    purpose,
    code,
  });

  const codeMatches = hashesMatch(otpRecord.codeHash, submittedCodeHash);

  if (!codeMatches) {
    const nextAttemptCount = otpRecord.attemptCount + 1;

    const shouldLock = nextAttemptCount >= maxAttempts;

    const updateResult = await database.otpCode.updateMany({
      where: {
        id: otpRecord.id,
        usedAt: null,
        attemptCount: otpRecord.attemptCount,
      },

      data: {
        attemptCount: nextAttemptCount,

        ...(shouldLock
          ? {
              usedAt: now,
            }
          : {}),
      },
    });

    if (updateResult.count !== 1) {
      return {
        status: "USED",
      };
    }

    return {
      status: shouldLock ? "TOO_MANY_ATTEMPTS" : "INVALID",

      remainingAttempts: Math.max(maxAttempts - nextAttemptCount, 0),
    };
  }

  const consumeResult = await database.otpCode.updateMany({
    where: {
      id: otpRecord.id,
      usedAt: null,
      attemptCount: otpRecord.attemptCount,
    },

    data: {
      usedAt: now,
    },
  });

  if (consumeResult.count !== 1) {
    return {
      status: "USED",
    };
  }

  return {
    status: "VERIFIED",
  };
}
