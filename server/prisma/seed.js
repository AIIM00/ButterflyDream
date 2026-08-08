import "dotenv/config";
import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";

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
  const storeName = getRequiredEnvironmentVariable("STORE_NAME");

  const rawDeliveryFee = getRequiredEnvironmentVariable("DEFAULT_DELIVERY_FEE");

  validateStoreName(storeName);

  return {
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

async function main() {
  const configuration = getSeedConfiguration();

  const seedResult = await prisma.$transaction(async (transaction) => {
    const storeSettingsResult = await seedStoreSettings(
      transaction,
      configuration,
    );

    const categories = await seedCategories(transaction);

    return {
      storeSettingsResult,
      categories,
    };
  });

  console.log("\nDatabase seed completed successfully.");

  console.log(
    seedResult.storeSettingsResult.created
      ? `Store settings created: ${seedResult.storeSettingsResult.record.storeName}`
      : `Store settings already exist: ${seedResult.storeSettingsResult.record.storeName}`,
  );

  console.log(`Accessory categories ready: ${seedResult.categories.length}`);
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
