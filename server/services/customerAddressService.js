import prisma from "../src/prisma.js";
import { MAX_CUSTOMER_ADDRESSES } from "../utils/customerAddressValidation.js";

const addressSelect = {
  id: true,
  userId: true,
  label: true,
  recipientName: true,
  phone: true,
  governorate: true,
  city: true,
  street: true,
  building: true,
  floor: true,
  landmark: true,
  notes: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
};
async function findActiveDeliveryGovernorate(database, governorateName) {
  if (typeof governorateName !== "string" || !governorateName.trim()) {
    return null;
  }

  return database.deliveryGovernorate.findFirst({
    where: {
      isActive: true,

      name: {
        equals: governorateName.trim(),
        mode: "insensitive",
      },
    },

    select: {
      id: true,
      name: true,
      deliveryFee: true,
      isActive: true,
    },
  });
}
async function findCustomerAddresses(database, userId) {
  return database.address.findMany({
    where: {
      userId,
    },

    orderBy: [
      {
        isDefault: "desc",
      },
      {
        updatedAt: "desc",
      },
    ],

    select: addressSelect,
  });
}

export async function getCustomerAddresses(userId) {
  return findCustomerAddresses(prisma, userId);
}

export async function createCustomerAddress(userId, input) {
  return prisma.$transaction(async (transaction) => {
    const addressCount = await transaction.address.count({
      where: {
        userId,
      },
    });

    if (addressCount >= MAX_CUSTOMER_ADDRESSES) {
      return {
        status: "LIMIT_REACHED",
        maximumAddresses: MAX_CUSTOMER_ADDRESSES,
      };
    }
    const deliveryGovernorate = await findActiveDeliveryGovernorate(
      transaction,
      input.governorate,
    );

    if (!deliveryGovernorate) {
      return {
        status: "DELIVERY_GOVERNORATE_UNAVAILABLE",

        governorate: input.governorate,
      };
    }
    const shouldBeDefault = addressCount === 0 || input.isDefault;

    if (shouldBeDefault) {
      await transaction.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },

        data: {
          isDefault: false,
        },
      });
    }

    const address = await transaction.address.create({
      data: {
        userId,
        label: input.label,
        recipientName: input.recipientName,
        phone: input.phone,
        governorate: deliveryGovernorate.name,
        city: input.city,
        street: input.street,
        building: input.building,
        floor: input.floor,
        landmark: input.landmark,
        notes: input.notes,
        isDefault: shouldBeDefault,
      },

      select: addressSelect,
    });

    const addresses = await findCustomerAddresses(transaction, userId);

    return {
      status: "CREATED",
      address,
      addresses,
    };
  });
}

export async function updateCustomerAddress(userId, addressId, input) {
  return prisma.$transaction(async (transaction) => {
    const existingAddress = await transaction.address.findFirst({
      where: {
        id: addressId,
        userId,
      },

      select: {
        id: true,
      },
    });

    if (!existingAddress) {
      return {
        status: "NOT_FOUND",
      };
    }

    let updateData = {
      ...input,
    };

    if (input.governorate !== undefined) {
      const deliveryGovernorate = await findActiveDeliveryGovernorate(
        transaction,
        input.governorate,
      );

      if (!deliveryGovernorate) {
        return {
          status: "DELIVERY_GOVERNORATE_UNAVAILABLE",

          governorate: input.governorate,
        };
      }

      updateData = {
        ...updateData,

        governorate: deliveryGovernorate.name,
      };
    }

    const address = await transaction.address.update({
      where: {
        id: addressId,
      },

      data: updateData,

      select: addressSelect,
    });

    const addresses = await findCustomerAddresses(transaction, userId);

    return {
      status: "UPDATED",
      address,
      addresses,
    };
  });
}

export async function setDefaultCustomerAddress(userId, addressId) {
  return prisma.$transaction(async (transaction) => {
    const existingAddress = await transaction.address.findFirst({
      where: {
        id: addressId,
        userId,
      },

      select: {
        id: true,
        isDefault: true,
      },
    });

    if (!existingAddress) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (!existingAddress.isDefault) {
      await transaction.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },

        data: {
          isDefault: false,
        },
      });

      await transaction.address.update({
        where: {
          id: addressId,
        },

        data: {
          isDefault: true,
        },
      });
    }

    const address = await transaction.address.findUnique({
      where: {
        id: addressId,
      },

      select: addressSelect,
    });

    const addresses = await findCustomerAddresses(transaction, userId);

    return {
      status: "DEFAULT_UPDATED",
      address,
      addresses,
    };
  });
}

export async function deleteCustomerAddress(userId, addressId) {
  return prisma.$transaction(async (transaction) => {
    const existingAddress = await transaction.address.findFirst({
      where: {
        id: addressId,
        userId,
      },

      select: {
        id: true,
        isDefault: true,
      },
    });

    if (!existingAddress) {
      return {
        status: "NOT_FOUND",
      };
    }

    await transaction.address.delete({
      where: {
        id: addressId,
      },
    });

    if (existingAddress.isDefault) {
      const replacementAddress = await transaction.address.findFirst({
        where: {
          userId,
        },

        orderBy: {
          updatedAt: "desc",
        },

        select: {
          id: true,
        },
      });

      if (replacementAddress) {
        await transaction.address.update({
          where: {
            id: replacementAddress.id,
          },

          data: {
            isDefault: true,
          },
        });
      }
    }

    const addresses = await findCustomerAddresses(transaction, userId);

    return {
      status: "DELETED",
      addresses,
    };
  });
}
export async function getCustomerDeliveryGovernorates() {
  const [governorates, storeSetting] = await Promise.all([
    prisma.deliveryGovernorate.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        deliveryFee: true,
        isActive: true,
      },
    }),

    prisma.storeSetting.findFirst({
      orderBy: {
        createdAt: "asc",
      },

      select: {
        currency: true,
      },
    }),
  ]);

  return {
    currency: storeSetting?.currency ?? "USD",

    governorates: governorates.map((governorate) => ({
      id: governorate.id,
      name: governorate.name,

      deliveryFee: governorate.deliveryFee.toFixed(2),
    })),
  };
}
