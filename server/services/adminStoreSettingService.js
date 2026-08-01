import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";

const DEFAULT_STORE_SETTING = {
  storeName: "Butterfly Dream",

  currency: "USD",

  defaultDeliveryFee: "0.00",

  ordersEnabled: true,
};

const storeSettingSelect = {
  id: true,
  storeName: true,
  currency: true,
  defaultDeliveryFee: true,
  ordersEnabled: true,
  createdAt: true,
  updatedAt: true,
};

function serializeStoreSetting(setting) {
  return {
    ...setting,

    defaultDeliveryFee: new Prisma.Decimal(setting.defaultDeliveryFee).toFixed(
      2,
    ),
  };
}

async function findStoreSetting(database) {
  return database.storeSetting.findFirst({
    orderBy: {
      createdAt: "asc",
    },

    select: storeSettingSelect,
  });
}

async function getOrCreateStoreSetting(database) {
  const existingSetting = await findStoreSetting(database);

  if (existingSetting) {
    return existingSetting;
  }

  return database.storeSetting.create({
    data: {
      storeName: DEFAULT_STORE_SETTING.storeName,

      currency: DEFAULT_STORE_SETTING.currency,

      defaultDeliveryFee: new Prisma.Decimal(
        DEFAULT_STORE_SETTING.defaultDeliveryFee,
      ),

      ordersEnabled: DEFAULT_STORE_SETTING.ordersEnabled,
    },

    select: storeSettingSelect,
  });
}

export async function getAdminStoreSetting() {
  const setting = await getOrCreateStoreSetting(prisma);

  return serializeStoreSetting(setting);
}

export async function updateAdminStoreSetting(input) {
  return prisma.$transaction(async (transaction) => {
    const existingSetting = await getOrCreateStoreSetting(transaction);

    const setting = await transaction.storeSetting.update({
      where: {
        id: existingSetting.id,
      },

      data: {
        ...(input.storeName !== undefined
          ? {
              storeName: input.storeName,
            }
          : {}),

        ...(input.currency !== undefined
          ? {
              currency: input.currency,
            }
          : {}),

        ...(input.defaultDeliveryFee !== undefined
          ? {
              defaultDeliveryFee: new Prisma.Decimal(input.defaultDeliveryFee),
            }
          : {}),

        ...(input.ordersEnabled !== undefined
          ? {
              ordersEnabled: input.ordersEnabled,
            }
          : {}),
      },

      select: storeSettingSelect,
    });

    return serializeStoreSetting(setting);
  });
}
