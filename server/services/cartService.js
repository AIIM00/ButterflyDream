import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";

const MAX_CART_ITEM_QUANTITY = 99;

const variantCartSelect = {
  id: true,
  productId: true,
  sku: true,
  displayName: true,
  options: true,
  price: true,
  isDefault: true,
  isActive: true,
  archivedAt: true,

  inventory: {
    select: {
      id: true,
      stockQuantity: true,
      lowStockThreshold: true,
    },
  },

  images: {
    orderBy: [
      {
        isPrimary: "desc",
      },
      {
        position: "asc",
      },
    ],

    take: 1,

    select: {
      id: true,
      imageUrl: true,
      altText: true,
      position: true,
      isPrimary: true,
    },
  },

  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      archivedAt: true,

      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
        },
      },

      images: {
        orderBy: [
          {
            isPrimary: "desc",
          },
          {
            position: "asc",
          },
        ],

        take: 1,

        select: {
          id: true,
          imageUrl: true,
          altText: true,
          position: true,
          isPrimary: true,
        },
      },
    },
  },
};

const cartDetailSelect = {
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,

  items: {
    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      cartId: true,
      variantId: true,
      quantity: true,
      unitPriceSnapshot: true,
      createdAt: true,
      updatedAt: true,

      variant: {
        select: variantCartSelect,
      },
    },
  },
};

function formatMoney(value) {
  return value.toFixed(2);
}

function getAvailableStock(variant) {
  return variant.inventory?.stockQuantity ?? 0;
}

function getStockStatus(variant) {
  const stockQuantity = getAvailableStock(variant);

  if (stockQuantity <= 0) {
    return "OUT_OF_STOCK";
  }

  const lowStockThreshold = variant.inventory?.lowStockThreshold ?? 0;

  if (stockQuantity <= lowStockThreshold) {
    return "LOW_STOCK";
  }

  return "IN_STOCK";
}

function getVariantAvailability(variant) {
  if (variant.product.archivedAt || variant.product.status !== "ACTIVE") {
    return {
      available: false,
      reason: "PRODUCT_UNAVAILABLE",
    };
  }

  if (!variant.product.category.isActive) {
    return {
      available: false,
      reason: "CATEGORY_UNAVAILABLE",
    };
  }

  if (variant.archivedAt || !variant.isActive) {
    return {
      available: false,
      reason: "VARIANT_UNAVAILABLE",
    };
  }

  if (getAvailableStock(variant) <= 0) {
    return {
      available: false,
      reason: "OUT_OF_STOCK",
    };
  }

  return {
    available: true,
    reason: null,
  };
}

function getCartImage(variant) {
  return variant.images[0] ?? variant.product.images[0] ?? null;
}

function serializeCart(cart) {
  let currentSubtotal = new Prisma.Decimal(0);

  let snapshotSubtotal = new Prisma.Decimal(0);

  let totalQuantity = 0;
  let hasPriceChanges = false;
  let hasUnavailableItems = false;
  let hasInsufficientStock = false;

  const items = cart.items.map((item) => {
    const variant = item.variant;

    const availability = getVariantAvailability(variant);

    const availableStock = getAvailableStock(variant);

    const priceChanged = !item.unitPriceSnapshot.equals(variant.price);

    const quantityAvailable = item.quantity <= availableStock;

    const currentLineTotal = variant.price.mul(item.quantity);

    const snapshotLineTotal = item.unitPriceSnapshot.mul(item.quantity);

    currentSubtotal = currentSubtotal.add(currentLineTotal);

    snapshotSubtotal = snapshotSubtotal.add(snapshotLineTotal);

    totalQuantity += item.quantity;

    if (priceChanged) {
      hasPriceChanges = true;
    }

    if (!availability.available) {
      hasUnavailableItems = true;
    }

    if (!quantityAvailable) {
      hasInsufficientStock = true;
    }

    const image = getCartImage(variant);

    return {
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,

      product: {
        id: variant.product.id,
        name: variant.product.name,
        slug: variant.product.slug,

        category: variant.product.category,
      },

      variant: {
        id: variant.id,
        sku: variant.sku,
        displayName: variant.displayName,
        options: variant.options,
        isDefault: variant.isDefault,
        isActive: variant.isActive,
        archivedAt: variant.archivedAt,
      },

      image,

      currency: "USD",

      unitPrice: formatMoney(variant.price),

      unitPriceSnapshot: formatMoney(item.unitPriceSnapshot),

      priceChanged,

      lineTotal: formatMoney(currentLineTotal),

      snapshotLineTotal: formatMoney(snapshotLineTotal),

      availability: {
        available: availability.available,

        reason: availability.reason,

        stockStatus: getStockStatus(variant),

        availableStock,

        quantityAvailable,
      },

      createdAt: item.createdAt,

      updatedAt: item.updatedAt,
    };
  });

  return {
    id: cart.id,
    userId: cart.userId,
    currency: "USD",
    items,

    summary: {
      distinctItemCount: items.length,

      totalQuantity,

      subtotal: formatMoney(currentSubtotal),

      snapshotSubtotal: formatMoney(snapshotSubtotal),

      hasPriceChanges,
      hasUnavailableItems,
      hasInsufficientStock,

      requiresPriceConfirmation: hasPriceChanges,

      canCheckout:
        items.length > 0 &&
        !hasPriceChanges &&
        !hasUnavailableItems &&
        !hasInsufficientStock,
    },

    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}

async function findCartDetails(database, userId) {
  return database.cart.findUnique({
    where: {
      userId,
    },

    select: cartDetailSelect,
  });
}

async function findVariantForCart(database, variantId) {
  return database.productVariant.findUnique({
    where: {
      id: variantId,
    },

    select: variantCartSelect,
  });
}

function validatePurchasableVariant(variant, requestedQuantity) {
  if (!variant) {
    return {
      status: "VARIANT_NOT_FOUND",
    };
  }

  const availability = getVariantAvailability(variant);

  if (!availability.available) {
    return {
      status: availability.reason,

      availableStock: getAvailableStock(variant),
    };
  }

  const availableStock = getAvailableStock(variant);

  if (requestedQuantity > availableStock) {
    return {
      status: "INSUFFICIENT_STOCK",
      availableStock,
    };
  }

  return {
    status: "AVAILABLE",
    availableStock,
  };
}

export async function getCustomerCart(userId) {
  const cart = await prisma.cart.upsert({
    where: {
      userId,
    },

    update: {},

    create: {
      userId,
    },

    select: cartDetailSelect,
  });

  return serializeCart(cart);
}

export async function addCustomerCartItem(userId, { variantId, quantity }) {
  return prisma.$transaction(async (transaction) => {
    const variant = await findVariantForCart(transaction, variantId);

    const initialValidation = validatePurchasableVariant(variant, quantity);

    if (initialValidation.status !== "AVAILABLE") {
      return initialValidation;
    }

    const cart = await transaction.cart.upsert({
      where: {
        userId,
      },

      update: {},

      create: {
        userId,
      },

      select: {
        id: true,
      },
    });

    const existingItem = await transaction.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },

      select: {
        id: true,
        quantity: true,
      },
    });

    const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

    if (nextQuantity > MAX_CART_ITEM_QUANTITY) {
      return {
        status: "QUANTITY_LIMIT",

        maximumQuantity: MAX_CART_ITEM_QUANTITY,
      };
    }

    const stockValidation = validatePurchasableVariant(variant, nextQuantity);

    if (stockValidation.status !== "AVAILABLE") {
      return stockValidation;
    }

    if (existingItem) {
      await transaction.cartItem.update({
        where: {
          id: existingItem.id,
        },

        data: {
          quantity: nextQuantity,

          unitPriceSnapshot: variant.price,
        },
      });
    } else {
      await transaction.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,

          unitPriceSnapshot: variant.price,
        },
      });
    }

    const updatedCart = await findCartDetails(transaction, userId);

    return {
      status: "UPDATED",

      cart: serializeCart(updatedCart),
    };
  });
}

export async function updateCustomerCartItem(userId, cartItemId, quantity) {
  return prisma.$transaction(async (transaction) => {
    const item = await transaction.cartItem.findFirst({
      where: {
        id: cartItemId,

        cart: {
          userId,
        },
      },

      select: {
        id: true,

        variant: {
          select: variantCartSelect,
        },
      },
    });

    if (!item) {
      return {
        status: "ITEM_NOT_FOUND",
      };
    }

    const validation = validatePurchasableVariant(item.variant, quantity);

    if (validation.status !== "AVAILABLE") {
      return validation;
    }

    await transaction.cartItem.update({
      where: {
        id: cartItemId,
      },

      data: {
        quantity,

        unitPriceSnapshot: item.variant.price,
      },
    });

    const updatedCart = await findCartDetails(transaction, userId);

    return {
      status: "UPDATED",

      cart: serializeCart(updatedCart),
    };
  });
}

export async function removeCustomerCartItem(userId, cartItemId) {
  return prisma.$transaction(async (transaction) => {
    const item = await transaction.cartItem.findFirst({
      where: {
        id: cartItemId,

        cart: {
          userId,
        },
      },

      select: {
        id: true,
      },
    });

    if (!item) {
      return {
        status: "ITEM_NOT_FOUND",
      };
    }

    await transaction.cartItem.delete({
      where: {
        id: cartItemId,
      },
    });

    const updatedCart = await findCartDetails(transaction, userId);

    return {
      status: "REMOVED",

      cart: serializeCart(updatedCart),
    };
  });
}

export async function clearCustomerCart(userId) {
  return prisma.$transaction(async (transaction) => {
    const cart = await transaction.cart.upsert({
      where: {
        userId,
      },

      update: {},

      create: {
        userId,
      },

      select: {
        id: true,
      },
    });

    await transaction.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    const updatedCart = await findCartDetails(transaction, userId);

    return {
      status: "CLEARED",

      cart: serializeCart(updatedCart),
    };
  });
}

export async function refreshCustomerCartPrices(userId) {
  return prisma.$transaction(async (transaction) => {
    await transaction.cart.upsert({
      where: {
        userId,
      },

      update: {},

      create: {
        userId,
      },

      select: {
        id: true,
      },
    });

    const cart = await findCartDetails(transaction, userId);

    for (const item of cart.items) {
      const availability = getVariantAvailability(item.variant);

      if (availability.available) {
        await transaction.cartItem.update({
          where: {
            id: item.id,
          },

          data: {
            unitPriceSnapshot: item.variant.price,
          },
        });
      }
    }

    const updatedCart = await findCartDetails(transaction, userId);

    return {
      status: "PRICES_REFRESHED",

      cart: serializeCart(updatedCart),
    };
  });
}
