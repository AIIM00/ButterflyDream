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
        governorate: input.governorate,
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

    const address = await transaction.address.update({
      where: {
        id: addressId,
      },

      data: input,

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
