import prisma from "../src/prisma.js";

const wishlistProductSelect = {
  id: true,
  categoryId: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  isFeatured: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,

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

  variants: {
    where: {
      archivedAt: null,
    },

    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "asc",
      },
    ],

    select: {
      id: true,
      sku: true,
      displayName: true,
      options: true,
      price: true,
      isDefault: true,
      isActive: true,
      archivedAt: true,

      inventory: {
        select: {
          stockQuantity: true,
          lowStockThreshold: true,
        },
      },
    },
  },
};

const wishlistDetailSelect = {
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,

  items: {
    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      wishlistId: true,
      productId: true,
      createdAt: true,

      product: {
        select: wishlistProductSelect,
      },
    },
  },
};

function getActiveVariants(product) {
  return product.variants.filter(
    (variant) => variant.isActive && !variant.archivedAt,
  );
}

function getProductAvailability(product) {
  if (product.status !== "ACTIVE" || product.archivedAt) {
    return {
      available: false,
      reason: "PRODUCT_UNAVAILABLE",
      inStock: false,
    };
  }

  if (!product.category.isActive) {
    return {
      available: false,
      reason: "CATEGORY_UNAVAILABLE",
      inStock: false,
    };
  }

  const activeVariants = getActiveVariants(product);

  if (activeVariants.length === 0) {
    return {
      available: false,
      reason: "NO_ACTIVE_VARIANTS",
      inStock: false,
    };
  }

  const inStock = activeVariants.some(
    (variant) => (variant.inventory?.stockQuantity ?? 0) > 0,
  );

  return {
    available: true,
    reason: null,
    inStock,
  };
}

function calculateProductPricing(product) {
  const activeVariants = getActiveVariants(product);

  if (activeVariants.length === 0) {
    return {
      minPrice: null,
      maxPrice: null,
      hasPriceRange: false,
    };
  }

  let minPrice = activeVariants[0].price;

  let maxPrice = activeVariants[0].price;

  for (const variant of activeVariants) {
    if (variant.price.lessThan(minPrice)) {
      minPrice = variant.price;
    }

    if (variant.price.greaterThan(maxPrice)) {
      maxPrice = variant.price;
    }
  }

  return {
    minPrice: minPrice.toFixed(2),

    maxPrice: maxPrice.toFixed(2),

    hasPriceRange: !minPrice.equals(maxPrice),
  };
}

function serializeWishlistProduct(product) {
  const availability = getProductAvailability(product);

  const activeVariants = getActiveVariants(product);

  const defaultVariant =
    activeVariants.find((variant) => variant.isDefault) ??
    activeVariants[0] ??
    null;

  return {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    isFeatured: product.isFeatured,

    category: product.category,

    image: product.images[0] ?? null,

    pricing: calculateProductPricing(product),

    defaultVariant: defaultVariant
      ? {
          id: defaultVariant.id,

          sku: defaultVariant.sku,

          displayName: defaultVariant.displayName,

          options: defaultVariant.options,

          price: defaultVariant.price.toFixed(2),

          stockQuantity: defaultVariant.inventory?.stockQuantity ?? 0,
        }
      : null,

    variantCount: activeVariants.length,

    availability,
    inStock: availability.inStock,

    createdAt: product.createdAt,

    updatedAt: product.updatedAt,
  };
}

function serializeWishlist(wishlist) {
  return {
    id: wishlist.id,
    userId: wishlist.userId,

    items: wishlist.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      savedAt: item.createdAt,

      product: serializeWishlistProduct(item.product),
    })),

    summary: {
      itemCount: wishlist.items.length,

      availableItemCount: wishlist.items.filter(
        (item) => getProductAvailability(item.product).available,
      ).length,

      inStockItemCount: wishlist.items.filter(
        (item) => getProductAvailability(item.product).inStock,
      ).length,
    },

    createdAt: wishlist.createdAt,

    updatedAt: wishlist.updatedAt,
  };
}

async function getOrCreateWishlist(database, userId) {
  return database.wishlist.upsert({
    where: {
      userId,
    },

    update: {},

    create: {
      userId,
    },

    select: wishlistDetailSelect,
  });
}

async function findWishlistDetails(database, userId) {
  return database.wishlist.findUnique({
    where: {
      userId,
    },

    select: wishlistDetailSelect,
  });
}

export async function getCustomerWishlist(userId) {
  const wishlist = await getOrCreateWishlist(prisma, userId);

  return serializeWishlist(wishlist);
}

export async function addCustomerWishlistItem(userId, productId) {
  return prisma.$transaction(async (transaction) => {
    const product = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: wishlistProductSelect,
    });

    if (!product) {
      return {
        status: "PRODUCT_NOT_FOUND",
      };
    }

    const availability = getProductAvailability(product);

    if (!availability.available) {
      return {
        status: availability.reason,
      };
    }

    const wishlist = await transaction.wishlist.upsert({
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

    const existingItem = await transaction.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,

          productId,
        },
      },

      select: {
        id: true,
      },
    });

    await transaction.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,

          productId,
        },
      },

      update: {},

      create: {
        wishlistId: wishlist.id,

        productId,
      },
    });

    const updatedWishlist = await findWishlistDetails(transaction, userId);

    return {
      status: existingItem ? "ALREADY_SAVED" : "ADDED",

      wishlist: serializeWishlist(updatedWishlist),
    };
  });
}

export async function removeCustomerWishlistItem(userId, productId) {
  return prisma.$transaction(async (transaction) => {
    const wishlist = await transaction.wishlist.findUnique({
      where: {
        userId,
      },

      select: {
        id: true,
      },
    });

    if (!wishlist) {
      return {
        status: "NOT_SAVED",
      };
    }

    const wishlistItem = await transaction.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,

          productId,
        },
      },

      select: {
        id: true,
      },
    });

    if (!wishlistItem) {
      return {
        status: "NOT_SAVED",
      };
    }

    await transaction.wishlistItem.delete({
      where: {
        id: wishlistItem.id,
      },
    });

    const updatedWishlist = await findWishlistDetails(transaction, userId);

    return {
      status: "REMOVED",

      wishlist: serializeWishlist(updatedWishlist),
    };
  });
}
