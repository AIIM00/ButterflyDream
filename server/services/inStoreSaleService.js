import prisma from "../src/prisma.js";
const createSaleNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `STORE-${timestamp}-${random}`;
};

export async function searchInStoreSaleProducts({ search = "", limit = 20 }) {
  const normalizedSearch = typeof search === "string" ? search.trim() : "";

  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 50);

  const variants = await prisma.productVariant.findMany({
    where: {
      isActive: true,
      archivedAt: null,

      product: {
        is: {
          status: "ACTIVE",
          archivedAt: null,
        },
      },

      ...(normalizedSearch
        ? {
            OR: [
              {
                sku: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                displayName: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                product: {
                  is: {
                    name: {
                      contains: normalizedSearch,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },

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
          imageUrl: true,
          altText: true,
        },
      },

      product: {
        select: {
          id: true,
          name: true,
          slug: true,

          category: {
            select: {
              id: true,
              name: true,
            },
          },

          images: {
            where: {
              variantId: null,
            },

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
              imageUrl: true,
              altText: true,
            },
          },
        },
      },
    },

    orderBy: [
      {
        product: {
          name: "asc",
        },
      },
      {
        displayName: "asc",
      },
    ],

    take: safeLimit,
  });

  return variants.map((variant) => {
    const variantImage = variant.images[0] ?? null;
    const productImage = variant.product.images[0] ?? null;

    return {
      id: variant.id,

      productId: variant.product.id,
      productName: variant.product.name,
      productSlug: variant.product.slug,

      category: variant.product.category,

      sku: variant.sku,
      displayName: variant.displayName,
      options: variant.options,

      price: variant.price.toString(),

      stockQuantity: variant.inventory?.stockQuantity ?? 0,

      lowStockThreshold: variant.inventory?.lowStockThreshold ?? 0,

      inStock: (variant.inventory?.stockQuantity ?? 0) > 0,

      isDefault: variant.isDefault,

      image: variantImage ?? productImage,
    };
  });
}

export async function recordInStoreSale({
  adminUserId,
  paymentMethod,
  discountAmount = 0,
  customerName = null,
  customerPhone = null,
  note = null,
  items,
}) {
  if (!adminUserId) {
    throw new Error("Admin user is required.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one sale item is required.");
  }

  const safeDiscount = Number(discountAmount);

  if (!Number.isFinite(safeDiscount) || safeDiscount < 0) {
    throw new Error("Invalid discount amount.");
  }

  return prisma.$transaction(async (tx) => {
    const admin = await tx.user.findUnique({
      where: {
        id: adminUserId,
      },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      throw new Error("Only an admin can record an in-store sale.");
    }

    if (admin.status !== "ACTIVE") {
      throw new Error("Admin account is not active.");
    }

    const saleItems = [];

    let subtotal = 0;

    for (const item of items) {
      const quantity = Number(item.quantity);

      if (!item.variantId || !Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Invalid sale item.");
      }

      const variant = await tx.productVariant.findUnique({
        where: {
          id: item.variantId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              status: true,
              archivedAt: true,
            },
          },
          inventory: true,
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
          },
        },
      });

      if (!variant) {
        throw new Error(`Variant not found: ${item.variantId}`);
      }

      if (
        !variant.isActive ||
        variant.archivedAt ||
        variant.product.status !== "ACTIVE" ||
        variant.product.archivedAt
      ) {
        throw new Error(`${variant.displayName} is not available for sale.`);
      }

      if (!variant.inventory) {
        throw new Error(`Inventory does not exist for ${variant.displayName}.`);
      }

      if (variant.inventory.stockQuantity < quantity) {
        throw new Error(
          `Not enough stock for ${variant.displayName}. Available: ${variant.inventory.stockQuantity}.`,
        );
      }

      const unitPrice = Number(variant.price);

      const lineTotal = unitPrice * quantity;

      subtotal += lineTotal;

      saleItems.push({
        productId: variant.product.id,
        variantId: variant.id,

        productName: variant.product.name,
        variantName: variant.displayName,
        sku: variant.sku,
        options: variant.options,

        unitPrice,
        quantity,
        lineTotal,

        inventoryId: variant.inventory.id,
        stockBefore: variant.inventory.stockQuantity,
      });
    }

    if (safeDiscount > subtotal) {
      throw new Error("Discount cannot be greater than the subtotal.");
    }

    const totalAmount = subtotal - safeDiscount;

    const sale = await tx.inStoreSale.create({
      data: {
        saleNumber: createSaleNumber(),

        recordedByUserId: adminUserId,

        paymentMethod,

        subtotal,
        discountAmount: safeDiscount,
        totalAmount,

        customerName: customerName?.trim() || null,
        customerPhone: customerPhone?.trim() || null,
        note: note?.trim() || null,

        items: {
          create: saleItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,

            productName: item.productName,
            variantName: item.variantName,
            sku: item.sku,
            options: item.options,

            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
          })),
        },
      },
    });

    for (const item of saleItems) {
      const updateResult = await tx.inventory.updateMany({
        where: {
          id: item.inventoryId,
          stockQuantity: {
            gte: item.quantity,
          },
        },

        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });

      if (updateResult.count !== 1) {
        throw new Error(
          `Not enough stock for ${item.variantName}. Stock changed while recording the sale.`,
        );
      }

      const updatedInventory = await tx.inventory.findUnique({
        where: {
          id: item.inventoryId,
        },
        select: {
          stockQuantity: true,
        },
      });

      if (!updatedInventory) {
        throw new Error(`Inventory no longer exists for ${item.variantName}.`);
      }

      await tx.inventoryMovement.create({
        data: {
          inventoryId: item.inventoryId,
          inStoreSaleId: sale.id,
          createdByUserId: adminUserId,

          type: "IN_STORE_SALE",

          quantityChange: -item.quantity,

          stockBefore: item.stockBefore,
          stockAfter: updatedInventory.stockQuantity,

          note: `Physical store sale ${sale.saleNumber}`,
        },
      });
    }

    return tx.inStoreSale.findUnique({
      where: {
        id: sale.id,
      },

      include: {
        items: true,

        recordedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },

        inventoryMovements: true,
      },
    });
  });
}

export async function getInStoreSales({
  page = 1,
  limit = 20,
  search = "",
  status = "",
  paymentMethod = "",
  dateFrom = "",
  dateTo = "",
} = {}) {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  const safePage =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? Math.min(parsedPage, 100000)
      : 1;

  const safeLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 50)
      : 20;

  const normalizedSearch =
    typeof search === "string" ? search.trim().slice(0, 100) : "";

  const where = {};

  if (["COMPLETED", "CANCELLED", "REFUNDED"].includes(status)) {
    where.status = status;
  }

  if (["CASH", "CARD", "OTHER"].includes(paymentMethod)) {
    where.paymentMethod = paymentMethod;
  }

  if (normalizedSearch) {
    where.OR = [
      {
        saleNumber: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        customerName: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        customerPhone: {
          contains: normalizedSearch,
          mode: "insensitive",
        },
      },
      {
        items: {
          some: {
            OR: [
              {
                productName: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                variantName: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                sku: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      },
    ];
  }

  const soldAt = {};

  if (dateFrom) {
    const parsedDateFrom = new Date(dateFrom);

    if (!Number.isNaN(parsedDateFrom.getTime())) {
      soldAt.gte = parsedDateFrom;
    }
  }

  if (dateTo) {
    const parsedDateTo = new Date(dateTo);

    if (!Number.isNaN(parsedDateTo.getTime())) {
      parsedDateTo.setHours(23, 59, 59, 999);
      soldAt.lte = parsedDateTo;
    }
  }

  if (Object.keys(soldAt).length > 0) {
    where.soldAt = soldAt;
  }

  const skip = (safePage - 1) * safeLimit;

  const [sales, totalItems] = await prisma.$transaction([
    prisma.inStoreSale.findMany({
      where,

      orderBy: {
        soldAt: "desc",
      },

      skip,

      take: safeLimit,

      select: {
        id: true,
        saleNumber: true,

        status: true,
        paymentMethod: true,
        currency: true,

        subtotal: true,
        discountAmount: true,
        totalAmount: true,

        customerName: true,
        customerPhone: true,

        soldAt: true,
        cancelledAt: true,
        refundedAt: true,

        recordedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },

        _count: {
          select: {
            items: true,
          },
        },
      },
    }),

    prisma.inStoreSale.count({
      where,
    }),
  ]);

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safeLimit);

  return {
    sales: sales.map((sale) => ({
      id: sale.id,
      saleNumber: sale.saleNumber,

      status: sale.status,
      paymentMethod: sale.paymentMethod,
      currency: sale.currency,

      subtotal: sale.subtotal.toString(),
      discountAmount: sale.discountAmount.toString(),
      totalAmount: sale.totalAmount.toString(),

      customerName: sale.customerName,
      customerPhone: sale.customerPhone,

      soldAt: sale.soldAt,
      cancelledAt: sale.cancelledAt,
      refundedAt: sale.refundedAt,

      recordedBy: sale.recordedBy,

      itemCount: sale._count.items,
    })),

    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: totalPages > 0 && safePage < totalPages,
    },
  };
}
