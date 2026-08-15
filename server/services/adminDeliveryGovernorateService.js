import { Prisma } from "@prisma/client";

import prisma from "../src/prisma.js";

export const SUPPORTED_DELIVERY_GOVERNORATES = [
  "Beirut",
  "Mount Lebanon",
  "North Lebanon",
  "Akkar",
  "Bekaa",
  "Baalbek-Hermel",
  "South Lebanon",
  "Nabatieh",
];

const deliveryGovernorateSelect = {
  id: true,
  name: true,
  deliveryFee: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

function serializeDeliveryGovernorate(governorate) {
  return {
    ...governorate,

    deliveryFee: new Prisma.Decimal(governorate.deliveryFee).toFixed(2),
  };
}

function sortDeliveryGovernorates(governorates) {
  const positionByName = new Map(
    SUPPORTED_DELIVERY_GOVERNORATES.map((name, index) => [name, index]),
  );

  return [...governorates].sort((first, second) => {
    const firstPosition =
      positionByName.get(first.name) ?? Number.MAX_SAFE_INTEGER;

    const secondPosition =
      positionByName.get(second.name) ?? Number.MAX_SAFE_INTEGER;

    return firstPosition - secondPosition;
  });
}

async function ensureDeliveryGovernorates(database) {
  for (const name of SUPPORTED_DELIVERY_GOVERNORATES) {
    await database.deliveryGovernorate.upsert({
      where: {
        name,
      },

      update: {},

      create: {
        name,

        deliveryFee: new Prisma.Decimal("0.00"),

        isActive: false,
      },
    });
  }
}

export async function getAdminDeliveryGovernorates() {
  return prisma.$transaction(async (transaction) => {
    await ensureDeliveryGovernorates(transaction);

    const governorates = await transaction.deliveryGovernorate.findMany({
      where: {
        name: {
          in: SUPPORTED_DELIVERY_GOVERNORATES,
        },
      },

      select: deliveryGovernorateSelect,
    });

    return sortDeliveryGovernorates(governorates).map(
      serializeDeliveryGovernorate,
    );
  });
}

export async function updateAdminDeliveryGovernorate(governorateId, input) {
  return prisma.$transaction(async (transaction) => {
    await ensureDeliveryGovernorates(transaction);

    const existingGovernorate =
      await transaction.deliveryGovernorate.findUnique({
        where: {
          id: governorateId,
        },

        select: {
          id: true,
          name: true,
        },
      });

    if (!existingGovernorate) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (!SUPPORTED_DELIVERY_GOVERNORATES.includes(existingGovernorate.name)) {
      return {
        status: "NOT_FOUND",
      };
    }

    const governorate = await transaction.deliveryGovernorate.update({
      where: {
        id: governorateId,
      },

      data: {
        ...(input.deliveryFee !== undefined
          ? {
              deliveryFee: new Prisma.Decimal(input.deliveryFee),
            }
          : {}),

        ...(input.isActive !== undefined
          ? {
              isActive: input.isActive,
            }
          : {}),
      },

      select: deliveryGovernorateSelect,
    });

    return {
      status: "UPDATED",

      governorate: serializeDeliveryGovernorate(governorate),
    };
  });
}
