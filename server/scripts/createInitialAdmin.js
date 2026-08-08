import "dotenv/config";

import { randomInt } from "node:crypto";

import prisma from "../src/prisma.js";

import { sendInitialAdminCredentialsEmail } from "../services/emailService.js";
import { hashPassword } from "../services/passwordService.js";

const TEMPORARY_PASSWORD_LENGTH = 24;

/*
 * PostgreSQL advisory lock used only while checking/creating
 * the first administrator.
 *
 * This prevents two copies of this script from creating
 * administrators concurrently.
 */
const INITIAL_ADMIN_LOCK_KEY = 260808;

function getRequiredEnvironmentVariable(variableName) {
  const value = process.env[variableName]?.trim();

  if (!value) {
    throw new Error(
      `${variableName} is required. Add it to the server environment.`,
    );
  }

  return value;
}

function validateAdminName(adminName) {
  if (adminName.length < 2 || adminName.length > 120) {
    throw new Error("ADMIN_NAME must contain between 2 and 120 characters.");
  }
}

function normalizeAndValidateAdminEmail(rawEmail) {
  const email = rawEmail.trim().toLowerCase();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email.length > 255 || !emailPattern.test(email)) {
    throw new Error("ADMIN_EMAIL must contain a valid email address.");
  }

  return email;
}

function validateAdminPortalUrl(rawUrl) {
  let parsedUrl;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error("ADMIN_PORTAL_URL must contain a valid URL.");
  }

  if (
    process.env.NODE_ENV === "production" &&
    parsedUrl.protocol !== "https:"
  ) {
    throw new Error("ADMIN_PORTAL_URL must use HTTPS in production.");
  }

  return parsedUrl.toString().replace(/\/$/, "");
}

function getConfiguration() {
  const adminName = getRequiredEnvironmentVariable("ADMIN_NAME");

  const adminEmail = normalizeAndValidateAdminEmail(
    getRequiredEnvironmentVariable("ADMIN_EMAIL"),
  );

  const adminPortalUrl = validateAdminPortalUrl(
    getRequiredEnvironmentVariable("ADMIN_PORTAL_URL"),
  );

  validateAdminName(adminName);

  return {
    adminName,
    adminEmail,
    adminPortalUrl,
  };
}

function randomCharacter(characterSet) {
  return characterSet[randomInt(characterSet.length)];
}

function shuffleCharacters(characters) {
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInt(index + 1);

    [characters[index], characters[randomIndex]] = [
      characters[randomIndex],
      characters[index],
    ];
  }

  return characters;
}

function generateTemporaryPassword() {
  const lowercaseCharacters = "abcdefghijkmnopqrstuvwxyz";

  const uppercaseCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ";

  const numberCharacters = "23456789";

  const specialCharacters = "!@#$%^&*-_=+?";

  const allCharacters =
    lowercaseCharacters +
    uppercaseCharacters +
    numberCharacters +
    specialCharacters;

  const passwordCharacters = [
    randomCharacter(lowercaseCharacters),
    randomCharacter(uppercaseCharacters),
    randomCharacter(numberCharacters),
    randomCharacter(specialCharacters),
  ];

  while (passwordCharacters.length < TEMPORARY_PASSWORD_LENGTH) {
    passwordCharacters.push(randomCharacter(allCharacters));
  }

  return shuffleCharacters(passwordCharacters).join("");
}

async function createAdminRecord({ adminName, adminEmail, passwordHash }) {
  return prisma.$transaction(async (transaction) => {
    /*
     * Serializes initial-admin creation attempts.
     * PostgreSQL releases the lock automatically when
     * this transaction ends.
     */
    await transaction.$queryRaw`
      SELECT pg_advisory_xact_lock(${INITIAL_ADMIN_LOCK_KEY})
    `;

    const existingAdmin = await transaction.user.findFirst({
      where: {
        role: "ADMIN",
      },

      select: {
        id: true,
        email: true,
      },
    });

    if (existingAdmin) {
      throw new Error(
        `An administrator already exists (${existingAdmin.email}). ` +
          "The initial administrator script refuses to create another one.",
      );
    }

    const existingUserWithEmail = await transaction.user.findUnique({
      where: {
        email: adminEmail,
      },

      select: {
        id: true,
        role: true,
      },
    });

    if (existingUserWithEmail) {
      throw new Error(
        `The configured ADMIN_EMAIL already belongs to a ` +
          `${existingUserWithEmail.role} account. ` +
          "This script will not change an existing user's role.",
      );
    }

    return transaction.user.create({
      data: {
        fullName: adminName,
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",

        /*
         * The mailbox is controlled by the administrator
         * and the credentials are delivered directly there.
         */
        emailVerifiedAt: new Date(),

        /*
         * Step 4/5 prevents normal admin operations until
         * this becomes false.
         */
        mustChangePassword: true,
      },

      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });
  });
}

async function removeAdminAfterEmailFailure(adminId) {
  try {
    await prisma.user.delete({
      where: {
        id: adminId,
      },
    });

    console.error(
      "The new administrator record was removed because " +
        "the credentials email could not be sent.",
    );
  } catch (cleanupError) {
    console.error(
      "CRITICAL: The credentials email failed and the newly " +
        "created administrator record could not be removed automatically.",
    );

    console.error(
      cleanupError instanceof Error ? cleanupError.message : cleanupError,
    );
  }
}

async function main() {
  const configuration = getConfiguration();

  let temporaryPassword = generateTemporaryPassword();

  const passwordHash = await hashPassword(temporaryPassword);

  const admin = await createAdminRecord({
    adminName: configuration.adminName,
    adminEmail: configuration.adminEmail,
    passwordHash,
  });

  try {
    await sendInitialAdminCredentialsEmail({
      recipientEmail: admin.email,
      adminName: admin.fullName,
      temporaryPassword,
      adminPortalUrl: configuration.adminPortalUrl,
    });
  } catch (error) {
    /*
     * Do not leave behind an account whose generated
     * temporary password was never successfully delivered.
     */
    await removeAdminAfterEmailFailure(admin.id);

    throw new Error(
      "The initial administrator credentials email could not be sent.",
      {
        cause: error,
      },
    );
  } finally {
    /*
     * We never log the generated password.
     * Dropping our reference also minimizes how long this
     * script intentionally retains it.
     */
    temporaryPassword = null;
  }

  console.log("");
  console.log("Initial administrator created successfully.");
  console.log(`Admin email: ${admin.email}`);
  console.log("The temporary password was sent to the administrator email.");
  console.log("The administrator must change it after the first login.");
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("Initial administrator creation failed:");

    console.error(error instanceof Error ? error.message : error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
