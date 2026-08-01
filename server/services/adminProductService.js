import prisma from "../src/prisma.js";

const productAdminListSelect = {
  id: true,
  name: true,
  slug: true,
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
      isPrimary: true,
    },
  },

  variants: {
    select: {
      id: true,
      price: true,
      isActive: true,
      isDefault: true,
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

const productAdminDetailSelect = {
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

    select: {
      id: true,
      productId: true,
      variantId: true,
      imageUrl: true,
      altText: true,
      position: true,
      isPrimary: true,
      createdAt: true,
      updatedAt: true,
    },
  },

  variants: {
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
      productId: true,
      sku: true,
      displayName: true,
      options: true,
      price: true,
      isDefault: true,
      isActive: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,

      inventory: {
        select: {
          id: true,
          variantId: true,
          stockQuantity: true,
          lowStockThreshold: true,
          createdAt: true,
          updatedAt: true,
        },
      },

      images: {
        orderBy: {
          position: "asc",
        },

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

function formatPrice(price) {
  return price.toFixed(2);
}

function getMinimumActivePrice(variants) {
  const activeVariants = variants.filter(
    (variant) => variant.isActive && variant.archivedAt === null,
  );

  if (activeVariants.length === 0) {
    return null;
  }

  return activeVariants.reduce((minimum, variant) => {
    if (minimum === null || variant.price.lessThan(minimum)) {
      return variant.price;
    }

    return minimum;
  }, null);
}

function serializeProductListItem(product) {
  const activeVariants = product.variants.filter(
    (variant) => variant.isActive && variant.archivedAt === null,
  );

  const minimumPrice = getMinimumActivePrice(product.variants);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    status: product.status,
    isFeatured: product.isFeatured,
    archivedAt: product.archivedAt,
    category: product.category,
    image: product.images[0] ?? null,

    minimumPrice: minimumPrice ? formatPrice(minimumPrice) : null,

    currency: "USD",

    variantCount: product.variants.length,

    activeVariantCount: activeVariants.length,

    inStockVariantCount: activeVariants.filter(
      (variant) => (variant.inventory?.stockQuantity ?? 0) > 0,
    ).length,

    totalStock: activeVariants.reduce(
      (total, variant) => total + (variant.inventory?.stockQuantity ?? 0),
      0,
    ),

    createdAt: product.createdAt,

    updatedAt: product.updatedAt,
  };
}

function serializeProductDetail(product) {
  return {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    status: product.status,
    isFeatured: product.isFeatured,
    archivedAt: product.archivedAt,
    category: product.category,

    images: product.images,

    variants: product.variants.map((variant) => ({
      ...variant,

      price: formatPrice(variant.price),

      stockStatus:
        !variant.inventory || variant.inventory.stockQuantity <= 0
          ? "OUT_OF_STOCK"
          : variant.inventory.stockQuantity <=
              variant.inventory.lowStockThreshold
            ? "LOW_STOCK"
            : "IN_STOCK",
    })),

    createdAt: product.createdAt,

    updatedAt: product.updatedAt,
  };
}

function getProductOrderBy(sort) {
  switch (sort) {
    case "oldest":
      return [
        {
          createdAt: "asc",
        },
        {
          id: "asc",
        },
      ];

    case "name_asc":
      return [
        {
          name: "asc",
        },
        {
          id: "asc",
        },
      ];

    case "name_desc":
      return [
        {
          name: "desc",
        },
        {
          id: "asc",
        },
      ];

    case "newest":
    default:
      return [
        {
          createdAt: "desc",
        },
        {
          id: "asc",
        },
      ];
  }
}

function createPagination({ page, limit, totalItems }) {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

function buildProductListWhere(filters) {
  const conditions = [];

  conditions.push(
    filters.archived
      ? {
          archivedAt: {
            not: null,
          },
        }
      : {
          archivedAt: null,
        },
  );

  if (filters.status) {
    conditions.push({
      status: filters.status,
    });
  }

  if (filters.categoryId) {
    conditions.push({
      categoryId: filters.categoryId,
    });
  }

  if (filters.search) {
    conditions.push({
      OR: [
        {
          name: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
        {
          variants: {
            some: {
              OR: [
                {
                  sku: {
                    contains: filters.search,
                    mode: "insensitive",
                  },
                },
                {
                  displayName: {
                    contains: filters.search,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        },
      ],
    });
  }

  return conditions.length
    ? {
        AND: conditions,
      }
    : {};
}

export async function listAdminProducts(filters) {
  const where = buildProductListWhere(filters);

  const [totalItems, products] = await prisma.$transaction([
    prisma.product.count({
      where,
    }),

    prisma.product.findMany({
      where,
      skip: filters.skip,
      take: filters.limit,

      orderBy: getProductOrderBy(filters.sort),

      select: productAdminListSelect,
    }),
  ]);

  return {
    products: products.map(serializeProductListItem),

    pagination: createPagination({
      page: filters.page,
      limit: filters.limit,
      totalItems,
    }),
  };
}

export async function getAdminProductById(productId) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },

    select: productAdminDetailSelect,
  });

  return product ? serializeProductDetail(product) : null;
}

export async function createAdminProduct(input) {
  return prisma.$transaction(async (transaction) => {
    const category = await transaction.category.findUnique({
      where: {
        id: input.categoryId,
      },

      select: {
        id: true,
      },
    });

    if (!category) {
      return {
        status: "CATEGORY_NOT_FOUND",
      };
    }

    const product = await transaction.product.create({
      data: {
        category: {
          connect: {
            id: input.categoryId,
          },
        },

        name: input.name,
        slug: input.slug,
        description: input.description,
        status: input.status,
        isFeatured: input.isFeatured,

        variants: {
          create: input.variants.map((variant) => ({
            sku: variant.sku,
            displayName: variant.displayName,
            options: variant.options,
            price: variant.price,
            isDefault: variant.isDefault,
            isActive: variant.isActive,

            inventory: {
              create: {
                stockQuantity: variant.stockQuantity,
                lowStockThreshold: variant.lowStockThreshold,
              },
            },
          })),
        },

        ...(input.images.length > 0
          ? {
              images: {
                create: input.images.map((image, index) => ({
                  imageUrl: image.imageUrl,
                  altText: image.altText,
                  isPrimary: image.isPrimary,
                  position: index,
                })),
              },
            }
          : {}),
      },

      select: productAdminDetailSelect,
    });

    return {
      status: "CREATED",
      product: serializeProductDetail(product),
    };
  });
}

export async function updateAdminProduct(productId, input) {
  return prisma.$transaction(async (transaction) => {
    const product = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        id: true,
        archivedAt: true,
      },
    });

    if (!product) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (product.archivedAt) {
      return {
        status: "ARCHIVED",
      };
    }

    if (input.categoryId) {
      const category = await transaction.category.findUnique({
        where: {
          id: input.categoryId,
        },

        select: {
          id: true,
        },
      });

      if (!category) {
        return {
          status: "CATEGORY_NOT_FOUND",
        };
      }
    }

    const { categoryId, ...productFields } = input;

    const updatedProduct = await transaction.product.update({
      where: {
        id: productId,
      },

      data: {
        ...productFields,

        ...(categoryId
          ? {
              category: {
                connect: {
                  id: categoryId,
                },
              },
            }
          : {}),
      },

      select: productAdminDetailSelect,
    });

    return {
      status: "UPDATED",

      product: serializeProductDetail(updatedProduct),
    };
  });
}

export async function updateAdminProductStatus(productId, targetStatus) {
  return prisma.$transaction(async (transaction) => {
    const product = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        id: true,
        archivedAt: true,

        variants: {
          where: {
            isActive: true,
            archivedAt: null,
          },

          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
            isDefault: true,
          },
        },
      },
    });

    if (!product) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (product.archivedAt) {
      return {
        status: "ARCHIVED",
      };
    }

    if (targetStatus === "ACTIVE" && product.variants.length === 0) {
      return {
        status: "NO_ACTIVE_VARIANTS",
      };
    }

    if (
      targetStatus === "ACTIVE" &&
      !product.variants.some((variant) => variant.isDefault)
    ) {
      await transaction.productVariant.update({
        where: {
          id: product.variants[0].id,
        },

        data: {
          isDefault: true,
        },
      });
    }

    const updatedProduct = await transaction.product.update({
      where: {
        id: productId,
      },

      data: {
        status: targetStatus,
      },

      select: productAdminDetailSelect,
    });

    return {
      status: "UPDATED",

      product: serializeProductDetail(updatedProduct),
    };
  });
}

export async function archiveAdminProduct(productId) {
  return prisma.$transaction(async (transaction) => {
    const product = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        id: true,
        archivedAt: true,
      },
    });

    if (!product) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (product.archivedAt) {
      return {
        status: "ALREADY_ARCHIVED",
      };
    }

    const archivedAt = new Date();

    await transaction.productVariant.updateMany({
      where: {
        productId,
        archivedAt: null,
      },

      data: {
        isActive: false,
        archivedAt,
      },
    });

    const archivedProduct = await transaction.product.update({
      where: {
        id: productId,
      },

      data: {
        archivedAt,
        isFeatured: false,
      },

      select: productAdminDetailSelect,
    });

    return {
      status: "ARCHIVED",

      product: serializeProductDetail(archivedProduct),
    };
  });
}

export async function createAdminVariant(productId, input) {
  return prisma.$transaction(async (transaction) => {
    const product = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        id: true,
        archivedAt: true,

        variants: {
          where: {
            isDefault: true,
            archivedAt: null,
          },

          select: {
            id: true,
          },

          take: 1,
        },
      },
    });

    if (!product) {
      return {
        status: "PRODUCT_NOT_FOUND",
      };
    }

    if (product.archivedAt) {
      return {
        status: "PRODUCT_ARCHIVED",
      };
    }

    const shouldBeDefault = input.isDefault || product.variants.length === 0;

    if (shouldBeDefault) {
      await transaction.productVariant.updateMany({
        where: {
          productId,
          archivedAt: null,
        },

        data: {
          isDefault: false,
        },
      });
    }

    await transaction.productVariant.create({
      data: {
        productId,
        sku: input.sku,
        displayName: input.displayName,
        options: input.options,
        price: input.price,
        isDefault: shouldBeDefault,
        isActive: input.isActive,

        inventory: {
          create: {
            stockQuantity: input.stockQuantity,

            lowStockThreshold: input.lowStockThreshold,
          },
        },
      },
    });

    const updatedProduct = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: productAdminDetailSelect,
    });

    return {
      status: "CREATED",

      product: serializeProductDetail(updatedProduct),
    };
  });
}

export async function updateAdminVariant(productId, variantId, input) {
  return prisma.$transaction(async (transaction) => {
    const variant = await transaction.productVariant.findFirst({
      where: {
        id: variantId,
        productId,
      },

      select: {
        id: true,
        archivedAt: true,
      },
    });

    if (!variant) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (variant.archivedAt) {
      return {
        status: "ARCHIVED",
      };
    }

    if (input.isDefault) {
      await transaction.productVariant.updateMany({
        where: {
          productId,
          archivedAt: null,

          id: {
            not: variantId,
          },
        },

        data: {
          isDefault: false,
        },
      });

      input.isActive = true;
    }

    await transaction.productVariant.update({
      where: {
        id: variantId,
      },

      data: input,
    });

    const product = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: productAdminDetailSelect,
    });

    return {
      status: "UPDATED",

      product: serializeProductDetail(product),
    };
  });
}

export async function updateAdminVariantStatus(productId, variantId, isActive) {
  return prisma.$transaction(async (transaction) => {
    const variant = await transaction.productVariant.findFirst({
      where: {
        id: variantId,
        productId,
      },

      select: {
        id: true,
        isActive: true,
        isDefault: true,
        archivedAt: true,
      },
    });

    if (!variant) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (variant.archivedAt) {
      return {
        status: "ARCHIVED",
      };
    }

    if (variant.isActive === isActive) {
      const product = await transaction.product.findUnique({
        where: {
          id: productId,
        },

        select: productAdminDetailSelect,
      });

      return {
        status: "UPDATED",

        product: serializeProductDetail(product),
      };
    }

    if (!isActive) {
      const replacementVariant = await transaction.productVariant.findFirst({
        where: {
          productId,
          isActive: true,
          archivedAt: null,

          id: {
            not: variantId,
          },
        },

        orderBy: {
          createdAt: "asc",
        },

        select: {
          id: true,
        },
      });

      if (!replacementVariant) {
        return {
          status: "ONLY_ACTIVE_VARIANT",
        };
      }

      if (variant.isDefault) {
        await transaction.productVariant.update({
          where: {
            id: replacementVariant.id,
          },

          data: {
            isDefault: true,
          },
        });
      }
    }

    await transaction.productVariant.update({
      where: {
        id: variantId,
      },

      data: {
        isActive,

        isDefault: isActive ? variant.isDefault : false,
      },
    });

    if (isActive) {
      const defaultVariant = await transaction.productVariant.findFirst({
        where: {
          productId,
          isDefault: true,
          isActive: true,
          archivedAt: null,
        },

        select: {
          id: true,
        },
      });

      if (!defaultVariant) {
        await transaction.productVariant.update({
          where: {
            id: variantId,
          },

          data: {
            isDefault: true,
          },
        });
      }
    }

    const product = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: productAdminDetailSelect,
    });

    return {
      status: "UPDATED",

      product: serializeProductDetail(product),
    };
  });
}

export async function updateAdminInventory(productId, variantId, input) {
  return prisma.$transaction(async (transaction) => {
    const variant = await transaction.productVariant.findFirst({
      where: {
        id: variantId,
        productId,
        archivedAt: null,
      },

      select: {
        id: true,
      },
    });

    if (!variant) {
      return {
        status: "NOT_FOUND",
      };
    }

    await transaction.inventory.upsert({
      where: {
        variantId,
      },

      update: input,

      create: {
        variantId,
        stockQuantity: input.stockQuantity ?? 0,

        lowStockThreshold: input.lowStockThreshold ?? 5,
      },
    });

    const product = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: productAdminDetailSelect,
    });

    return {
      status: "UPDATED",

      product: serializeProductDetail(product),
    };
  });
}

export async function archiveAdminVariant(productId, variantId) {
  return prisma.$transaction(async (transaction) => {
    const variant = await transaction.productVariant.findFirst({
      where: {
        id: variantId,
        productId,
      },

      select: {
        id: true,
        isDefault: true,
        archivedAt: true,
      },
    });

    if (!variant) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (variant.archivedAt) {
      return {
        status: "ALREADY_ARCHIVED",
      };
    }

    const replacementVariant = await transaction.productVariant.findFirst({
      where: {
        productId,
        isActive: true,
        archivedAt: null,

        id: {
          not: variantId,
        },
      },

      orderBy: {
        createdAt: "asc",
      },

      select: {
        id: true,
      },
    });

    if (!replacementVariant) {
      return {
        status: "ONLY_ACTIVE_VARIANT",
      };
    }

    if (variant.isDefault) {
      await transaction.productVariant.update({
        where: {
          id: replacementVariant.id,
        },

        data: {
          isDefault: true,
        },
      });
    }

    await transaction.productVariant.update({
      where: {
        id: variantId,
      },

      data: {
        isActive: false,
        isDefault: false,
        archivedAt: new Date(),
      },
    });

    const product = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: productAdminDetailSelect,
    });

    return {
      status: "ARCHIVED",

      product: serializeProductDetail(product),
    };
  });
}

async function validateImageVariant(transaction, productId, variantId) {
  if (!variantId) {
    return true;
  }

  const variant = await transaction.productVariant.findFirst({
    where: {
      id: variantId,
      productId,
      archivedAt: null,
    },

    select: {
      id: true,
    },
  });

  return Boolean(variant);
}

export async function createAdminProductImage(productId, input) {
  return prisma.$transaction(async (transaction) => {
    const product = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        id: true,
        archivedAt: true,

        _count: {
          select: {
            images: true,
          },
        },
      },
    });

    if (!product) {
      return {
        status: "PRODUCT_NOT_FOUND",
      };
    }

    if (product.archivedAt) {
      return {
        status: "PRODUCT_ARCHIVED",
      };
    }

    const validVariant = await validateImageVariant(
      transaction,
      productId,
      input.variantId,
    );

    if (!validVariant) {
      return {
        status: "VARIANT_NOT_FOUND",
      };
    }

    const shouldBePrimary = input.isPrimary || product._count.images === 0;

    if (shouldBePrimary) {
      await transaction.productImage.updateMany({
        where: {
          productId,
        },

        data: {
          isPrimary: false,
        },
      });
    }

    let position = input.position;

    if (position === undefined) {
      const lastImage = await transaction.productImage.findFirst({
        where: {
          productId,
        },

        orderBy: {
          position: "desc",
        },

        select: {
          position: true,
        },
      });

      position = (lastImage?.position ?? -1) + 1;
    }

    await transaction.productImage.create({
      data: {
        productId,
        variantId: input.variantId,
        imageUrl: input.imageUrl,
        altText: input.altText,
        position,
        isPrimary: shouldBePrimary,
      },
    });

    const updatedProduct = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: productAdminDetailSelect,
    });

    return {
      status: "CREATED",

      product: serializeProductDetail(updatedProduct),
    };
  });
}

export async function updateAdminProductImage(productId, imageId, input) {
  return prisma.$transaction(async (transaction) => {
    const image = await transaction.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },

      select: {
        id: true,
      },
    });

    if (!image) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (Object.prototype.hasOwnProperty.call(input, "variantId")) {
      const validVariant = await validateImageVariant(
        transaction,
        productId,
        input.variantId,
      );

      if (!validVariant) {
        return {
          status: "VARIANT_NOT_FOUND",
        };
      }
    }

    if (input.isPrimary) {
      await transaction.productImage.updateMany({
        where: {
          productId,

          id: {
            not: imageId,
          },
        },

        data: {
          isPrimary: false,
        },
      });
    }

    await transaction.productImage.update({
      where: {
        id: imageId,
      },

      data: input,
    });

    const updatedProduct = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: productAdminDetailSelect,
    });

    return {
      status: "UPDATED",

      product: serializeProductDetail(updatedProduct),
    };
  });
}

export async function deleteAdminProductImage(productId, imageId) {
  return prisma.$transaction(async (transaction) => {
    const image = await transaction.productImage.findFirst({
      where: {
        id: imageId,
        productId,
      },

      select: {
        id: true,
        isPrimary: true,
      },
    });

    if (!image) {
      return {
        status: "NOT_FOUND",
      };
    }

    await transaction.productImage.delete({
      where: {
        id: imageId,
      },
    });

    const remainingImages = await transaction.productImage.findMany({
      where: {
        productId,
      },

      orderBy: [
        {
          position: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      select: {
        id: true,
        isPrimary: true,
      },
    });

    if (
      remainingImages.length > 0 &&
      !remainingImages.some((remainingImage) => remainingImage.isPrimary)
    ) {
      await transaction.productImage.update({
        where: {
          id: remainingImages[0].id,
        },

        data: {
          isPrimary: true,
        },
      });
    }

    for (let index = 0; index < remainingImages.length; index += 1) {
      await transaction.productImage.update({
        where: {
          id: remainingImages[index].id,
        },

        data: {
          position: index,
        },
      });
    }

    const updatedProduct = await transaction.product.findUnique({
      where: {
        id: productId,
      },

      select: productAdminDetailSelect,
    });

    return {
      status: "DELETED",

      product: serializeProductDetail(updatedProduct),
    };
  });
}
