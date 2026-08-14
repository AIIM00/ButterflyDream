import prisma from "../src/prisma.js";

const activeVariantWhere = {
  isActive: true,
  archivedAt: null,
};

const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  isFeatured: true,
  createdAt: true,
  updatedAt: true,

  category: {
    select: {
      id: true,
      name: true,
      slug: true,
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
    where: activeVariantWhere,

    orderBy: [
      {
        isDefault: "desc",
      },
      {
        price: "asc",
      },
    ],

    select: {
      id: true,
      displayName: true,
      options: true,
      price: true,
      isDefault: true,

      inventory: {
        select: {
          stockQuantity: true,
        },
      },
    },
  },
};

const productDetailSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  isFeatured: true,
  createdAt: true,
  updatedAt: true,

  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
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
      variantId: true,
      imageUrl: true,
      altText: true,
      position: true,
      isPrimary: true,
    },
  },

  variants: {
    where: activeVariantWhere,

    orderBy: [
      {
        isDefault: "desc",
      },
      {
        price: "asc",
      },
      {
        displayName: "asc",
      },
    ],

    select: {
      id: true,
      sku: true,
      displayName: true,
      options: true,
      price: true,
      isDefault: true,

      inventory: {
        select: {
          stockQuantity: true,
          lowStockThreshold: true,
        },
      },
    },
  },
};

function formatPrice(price) {
  return price.toFixed(2);
}

function getVariantStockQuantity(variant) {
  return variant.inventory?.stockQuantity ?? 0;
}

function isVariantInStock(variant) {
  return getVariantStockQuantity(variant) > 0;
}

function getMinimumVariantPrice(variants) {
  if (variants.length === 0) {
    return null;
  }

  return variants.reduce((minimumPrice, variant) => {
    if (minimumPrice === null || variant.price.lessThan(minimumPrice)) {
      return variant.price;
    }

    return minimumPrice;
  }, null);
}

function getMaximumVariantPrice(variants) {
  if (variants.length === 0) {
    return null;
  }

  return variants.reduce((maximumPrice, variant) => {
    if (maximumPrice === null || variant.price.greaterThan(maximumPrice)) {
      return variant.price;
    }

    return maximumPrice;
  }, null);
}

function serializeProductCard(product) {
  const minimumPrice = getMinimumVariantPrice(product.variants);

  const maximumPrice = getMaximumVariantPrice(product.variants);

  const defaultVariant =
    product.variants.find((variant) => variant.isDefault) ??
    product.variants[0] ??
    null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,

    isFeatured: product.isFeatured,

    category: product.category,

    image: product.images[0] ?? null,

    pricing: {
      minimum: minimumPrice === null ? null : formatPrice(minimumPrice),

      maximum: maximumPrice === null ? null : formatPrice(maximumPrice),

      hasPriceRange:
        minimumPrice !== null &&
        maximumPrice !== null &&
        !minimumPrice.equals(maximumPrice),

      currency: "USD",
    },

    defaultVariant: defaultVariant
      ? {
          id: defaultVariant.id,
          displayName: defaultVariant.displayName,
          options: defaultVariant.options,
          price: formatPrice(defaultVariant.price),
          inStock: isVariantInStock(defaultVariant),
        }
      : null,

    activeVariantCount: product.variants.length,

    inStock: product.variants.some(isVariantInStock),

    createdAt: product.createdAt,

    updatedAt: product.updatedAt,
  };
}

function getPublicStockStatus(variant) {
  const stockQuantity = variant.inventory?.stockQuantity ?? 0;

  const lowStockThreshold = variant.inventory?.lowStockThreshold ?? 0;

  if (stockQuantity <= 0) {
    return "OUT_OF_STOCK";
  }

  if (stockQuantity <= lowStockThreshold) {
    return "LOW_STOCK";
  }

  return "IN_STOCK";
}

function serializeProductDetail(product) {
  const minimumPrice = getMinimumVariantPrice(product.variants);

  const maximumPrice = getMaximumVariantPrice(product.variants);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,

    isFeatured: product.isFeatured,

    category: product.category,

    images: product.images,

    pricing: {
      minimum: minimumPrice === null ? null : formatPrice(minimumPrice),

      maximum: maximumPrice === null ? null : formatPrice(maximumPrice),

      hasPriceRange:
        minimumPrice !== null &&
        maximumPrice !== null &&
        !minimumPrice.equals(maximumPrice),

      currency: "USD",
    },

    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      displayName: variant.displayName,
      options: variant.options,
      price: formatPrice(variant.price),
      isDefault: variant.isDefault,

      inStock: isVariantInStock(variant),

      stockStatus: getPublicStockStatus(variant),
    })),

    inStock: product.variants.some(isVariantInStock),

    createdAt: product.createdAt,

    updatedAt: product.updatedAt,
  };
}

function buildActiveInventoryFilter() {
  return {
    inventory: {
      is: {
        stockQuantity: {
          gt: 0,
        },
      },
    },
  };
}

function buildProductWhere(filters) {
  const conditions = [
    {
      status: "ACTIVE",
    },
    {
      archivedAt: null,
    },
    {
      category: {
        is: {
          isActive: true,
        },
      },
    },
    {
      variants: {
        some: activeVariantWhere,
      },
    },
  ];

  if (filters.category) {
    conditions.push({
      category: {
        is: {
          slug: filters.category,
          isActive: true,
        },
      },
    });
  }

  if (filters.featured !== undefined) {
    conditions.push({
      isFeatured: filters.featured,
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
          description: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
        {
          category: {
            is: {
              name: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          variants: {
            some: {
              ...activeVariantWhere,

              OR: [
                {
                  displayName: {
                    contains: filters.search,
                    mode: "insensitive",
                  },
                },
                {
                  sku: {
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

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const priceFilter = {};

    if (filters.minPrice !== undefined) {
      priceFilter.gte = filters.minPrice;
    }

    if (filters.maxPrice !== undefined) {
      priceFilter.lte = filters.maxPrice;
    }

    conditions.push({
      variants: {
        some: {
          ...activeVariantWhere,
          price: priceFilter,
        },
      },
    });
  }

  if (filters.inStock === true) {
    conditions.push({
      variants: {
        some: {
          ...activeVariantWhere,
          ...buildActiveInventoryFilter(),
        },
      },
    });
  }

  if (filters.inStock === false) {
    conditions.push({
      variants: {
        none: {
          ...activeVariantWhere,
          ...buildActiveInventoryFilter(),
        },
      },
    });
  }

  return {
    AND: conditions,
  };
}

function getDatabaseOrderBy(sort) {
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

async function getPriceSortedProducts({ where, filters }) {
  const matchingProducts = await prisma.product.findMany({
    where,

    select: {
      id: true,

      variants: {
        where: activeVariantWhere,

        select: {
          price: true,
        },
      },
    },
  });

  const productsWithPrice = matchingProducts.map((product) => ({
    id: product.id,

    minimumPrice: getMinimumVariantPrice(product.variants),
  }));

  productsWithPrice.sort((firstProduct, secondProduct) => {
    if (firstProduct.minimumPrice === null) {
      return 1;
    }

    if (secondProduct.minimumPrice === null) {
      return -1;
    }

    const comparison = firstProduct.minimumPrice.comparedTo(
      secondProduct.minimumPrice,
    );

    if (comparison !== 0) {
      return filters.sort === "price_asc" ? comparison : -comparison;
    }

    return firstProduct.id.localeCompare(secondProduct.id);
  });

  const pageIds = productsWithPrice
    .slice(filters.skip, filters.skip + filters.limit)
    .map((product) => product.id);

  if (pageIds.length === 0) {
    return {
      products: [],
      totalItems: productsWithPrice.length,
    };
  }

  const pageProducts = await prisma.product.findMany({
    where: {
      id: {
        in: pageIds,
      },
    },

    select: productCardSelect,
  });

  const productsById = new Map(
    pageProducts.map((product) => [product.id, product]),
  );

  return {
    products: pageIds.map((id) => productsById.get(id)).filter(Boolean),

    totalItems: productsWithPrice.length,
  };
}

export async function getPublicCategories() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },

    orderBy: [
      {
        displayOrder: "asc",
      },
      {
        name: "asc",
      },
    ],

    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      displayOrder: true,

      _count: {
        select: {
          products: {
            where: {
              status: "ACTIVE",
              archivedAt: null,

              variants: {
                some: activeVariantWhere,
              },
            },
          },
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    displayOrder: category.displayOrder,

    productCount: category._count.products,
  }));
}

export async function getPublicProducts(filters) {
  const where = buildProductWhere(filters);

  let products;
  let totalItems;

  if (filters.sort === "price_asc" || filters.sort === "price_desc") {
    const result = await getPriceSortedProducts({
      where,
      filters,
    });

    products = result.products;
    totalItems = result.totalItems;
  } else {
    const [productCount, productRecords] = await prisma.$transaction([
      prisma.product.count({
        where,
      }),

      prisma.product.findMany({
        where,
        skip: filters.skip,
        take: filters.limit,

        orderBy: getDatabaseOrderBy(filters.sort),

        select: productCardSelect,
      }),
    ]);

    totalItems = productCount;
    products = productRecords;
  }

  return {
    products: products.map(serializeProductCard),

    pagination: createPagination({
      page: filters.page,
      limit: filters.limit,
      totalItems,
    }),

    appliedFilters: {
      search: filters.search ?? null,

      category: filters.category ?? null,

      featured: filters.featured ?? null,

      inStock: filters.inStock ?? null,

      minPrice: filters.minPrice ?? null,

      maxPrice: filters.maxPrice ?? null,

      sort: filters.sort,
    },
  };
}

export async function getPublicProductsByIds(productIds) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return [];
  }

  const uniqueProductIds = [...new Set(productIds)];

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: uniqueProductIds,
      },

      status: "ACTIVE",

      archivedAt: null,

      category: {
        is: {
          isActive: true,
        },
      },

      variants: {
        some: activeVariantWhere,
      },
    },

    select: productCardSelect,
  });

  const productById = new Map(products.map((product) => [product.id, product]));

  /*
   * Preserve the exact order chosen by admin.
   */
  return uniqueProductIds
    .map((productId) => productById.get(productId))
    .filter(Boolean)
    .map(serializeProductCard);
}
export async function getPublicProductBySlug(slug) {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      archivedAt: null,

      category: {
        is: {
          isActive: true,
        },
      },

      variants: {
        some: activeVariantWhere,
      },
    },

    select: productDetailSelect,
  });

  if (!product) {
    return null;
  }

  return serializeProductDetail(product);
}
