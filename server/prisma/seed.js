import "dotenv/config";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";

const PASSWORD_SALT_ROUNDS = 12;

const categorySeeds = [
  {
    name: "Necklaces",
    slug: "necklaces",
    description: "Fashion necklaces and pendants.",
    displayOrder: 1,
  },
  {
    name: "Bracelets",
    slug: "bracelets",
    description: "Bracelets, bangles, and wrist accessories.",
    displayOrder: 2,
  },
  {
    name: "Rings",
    slug: "rings",
    description: "Fashion rings in different styles and sizes.",
    displayOrder: 3,
  },
  {
    name: "Earrings",
    slug: "earrings",
    description: "Stud, hoop, drop, and other earring styles.",
    displayOrder: 4,
  },
  {
    name: "Watches",
    slug: "watches",
    description: "Fashion watches and wristwear.",
    displayOrder: 5,
  },
  {
    name: "Handbags",
    slug: "handbags",
    description: "Handbags, purses, and fashion bags.",
    displayOrder: 6,
  },
  {
    name: "Hair Accessories",
    slug: "hair-accessories",
    description: "Clips, bands, pins, and other hair accessories.",
    displayOrder: 7,
  },
  {
    name: "Customized Accessories",
    slug: "customized-accessories",
    description: "Accessories personalized with approved customer details.",
    displayOrder: 8,
  },
];

function getRequiredEnvironmentVariable(variableName) {
  const value = process.env[variableName]?.trim();

  if (!value) {
    throw new Error(
      `${variableName} is required. Add it to the server .env file.`,
    );
  }

  return value;
}

function validateAdminName(adminName) {
  if (adminName.length < 2 || adminName.length > 120) {
    throw new Error("ADMIN_NAME must contain between 2 and 120 characters.");
  }
}

function validateAdminEmail(adminEmail) {
  const basicEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (adminEmail.length > 255 || !basicEmailPattern.test(adminEmail)) {
    throw new Error("ADMIN_EMAIL must contain a valid email address.");
  }
}

function validateAdminPassword(adminPassword) {
  const passwordByteLength = Buffer.byteLength(adminPassword, "utf8");

  if (adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
  }

  if (passwordByteLength > 72) {
    throw new Error("ADMIN_PASSWORD must not exceed 72 UTF-8 bytes.");
  }

  if (!/[a-z]/.test(adminPassword)) {
    throw new Error("ADMIN_PASSWORD must contain a lowercase letter.");
  }

  if (!/[A-Z]/.test(adminPassword)) {
    throw new Error("ADMIN_PASSWORD must contain an uppercase letter.");
  }

  if (!/[0-9]/.test(adminPassword)) {
    throw new Error("ADMIN_PASSWORD must contain a number.");
  }

  if (!/[^A-Za-z0-9]/.test(adminPassword)) {
    throw new Error("ADMIN_PASSWORD must contain a special character.");
  }

  const obviousPlaceholderValues = [
    "REPLACE_WITH_A_STRONG_PASSWORD",
    "CHANGE_ME",
    "YOUR_PASSWORD",
  ];

  if (obviousPlaceholderValues.includes(adminPassword)) {
    throw new Error("ADMIN_PASSWORD still contains an example placeholder.");
  }
}

function validateStoreName(storeName) {
  if (storeName.length < 2 || storeName.length > 160) {
    throw new Error("STORE_NAME must contain between 2 and 160 characters.");
  }
}

function parseDeliveryFee(rawDeliveryFee) {
  const deliveryFeePattern = /^(0|[1-9][0-9]{0,7})(\.[0-9]{1,2})?$/;

  if (!deliveryFeePattern.test(rawDeliveryFee)) {
    throw new Error(
      "DEFAULT_DELIVERY_FEE must be a non-negative amount " +
        "with no more than two decimal places.",
    );
  }

  return new Prisma.Decimal(rawDeliveryFee);
}

function getSeedConfiguration() {
  const adminName = getRequiredEnvironmentVariable("ADMIN_NAME");

  const adminEmail =
    getRequiredEnvironmentVariable("ADMIN_EMAIL").toLowerCase();

  const adminPassword = getRequiredEnvironmentVariable("ADMIN_PASSWORD");

  const storeName = getRequiredEnvironmentVariable("STORE_NAME");

  const rawDeliveryFee = getRequiredEnvironmentVariable("DEFAULT_DELIVERY_FEE");

  validateAdminName(adminName);
  validateAdminEmail(adminEmail);
  validateAdminPassword(adminPassword);
  validateStoreName(storeName);

  return {
    adminName,
    adminEmail,
    adminPassword,
    storeName,
    defaultDeliveryFee: parseDeliveryFee(rawDeliveryFee),
  };
}

async function seedStoreSettings(transaction, configuration) {
  const existingSettings = await transaction.storeSetting.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: 2,
  });

  if (existingSettings.length > 1) {
    throw new Error(
      "Multiple StoreSetting records exist. Resolve them before running the seed again.",
    );
  }

  if (existingSettings.length === 1) {
    return {
      record: existingSettings[0],
      created: false,
    };
  }

  const storeSettings = await transaction.storeSetting.create({
    data: {
      storeName: configuration.storeName,
      currency: "USD",
      defaultDeliveryFee: configuration.defaultDeliveryFee,
      ordersEnabled: true,
    },
  });

  return {
    record: storeSettings,
    created: true,
  };
}

async function seedCategories(transaction) {
  const seededCategories = [];

  for (const categorySeed of categorySeeds) {
    const category = await transaction.category.upsert({
      where: {
        slug: categorySeed.slug,
      },
      update: {
        name: categorySeed.name,
        description: categorySeed.description,
        displayOrder: categorySeed.displayOrder,
      },
      create: {
        ...categorySeed,
        isActive: true,
      },
    });

    seededCategories.push(category);
  }

  return seededCategories;
}

async function seedAdmin(transaction, configuration, adminPasswordHash) {
  const existingUser = await transaction.user.findUnique({
    where: {
      email: configuration.adminEmail,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      deletedAt: true,
    },
  });

  if (existingUser) {
    if (existingUser.role !== "ADMIN") {
      throw new Error(
        `The email ${configuration.adminEmail} already belongs to a CUSTOMER account. ` +
          "The seed will not automatically promote a customer to ADMIN.",
      );
    }

    if (existingUser.status !== "ACTIVE" || existingUser.deletedAt !== null) {
      throw new Error(
        `The admin account ${configuration.adminEmail} exists but is not active. ` +
          "Resolve the account status manually before continuing.",
      );
    }

    return {
      record: existingUser,
      created: false,
    };
  }

  const admin = await transaction.user.create({
    data: {
      fullName: configuration.adminName,
      email: configuration.adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return {
    record: admin,
    created: true,
  };
}

async function main() {
  const configuration = getSeedConfiguration();

  const adminPasswordHash = await bcrypt.hash(
    configuration.adminPassword,
    PASSWORD_SALT_ROUNDS,
  );

  const seedResult = await prisma.$transaction(async (transaction) => {
    const storeSettingsResult = await seedStoreSettings(
      transaction,
      configuration,
    );

    const categories = await seedCategories(transaction);

    const adminResult = await seedAdmin(
      transaction,
      configuration,
      adminPasswordHash,
    );

    return {
      storeSettingsResult,
      categories,
      adminResult,
    };
  });

  console.log("\nDatabase seed completed successfully.");

  console.log(
    seedResult.storeSettingsResult.created
      ? `Store settings created: ${seedResult.storeSettingsResult.record.storeName}`
      : `Store settings already exist: ${seedResult.storeSettingsResult.record.storeName}`,
  );

  console.log(`Accessory categories ready: ${seedResult.categories.length}`);

  console.log(
    seedResult.adminResult.created
      ? `Admin account created: ${seedResult.adminResult.record.email}`
      : `Admin account already exists: ${seedResult.adminResult.record.email}`,
  );
}

main()
  .catch((error) => {
    console.error("\nDatabase seed failed:");
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
