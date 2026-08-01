import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const PAYMENT_STATUSES = ["UNPAID", "PAID", "FAILED", "REFUNDED"];

const PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"];

const recentOrderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  currency: true,
  totalAmount: true,

  customerName: true,
  customerEmail: true,

  deliveryCity: true,
  deliveryGovernorate: true,

  createdAt: true,

  _count: {
    select: {
      items: true,
    },
  },
};

const inventorySelect = {
  id: true,
  stockQuantity: true,
  lowStockThreshold: true,
  updatedAt: true,

  variant: {
    select: {
      id: true,
      sku: true,
      displayName: true,
      isActive: true,
      archivedAt: true,

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
              isActive: true,
            },
          },
        },
      },
    },
  },
};

function formatMoney(value) {
  return new Prisma.Decimal(value ?? 0).toFixed(2);
}

function getPeriodStartDate(period) {
  if (period === "all") {
    return null;
  }

  const daysByPeriod = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };

  const days = daysByPeriod[period];

  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function buildCountBreakdown(values, allowedValues, fieldName) {
  const breakdown = Object.fromEntries(
    allowedValues.map((value) => [value, 0]),
  );

  for (const item of values) {
    const key = item[fieldName];

    if (Object.hasOwn(breakdown, key)) {
      breakdown[key] = item._count._all;
    }
  }

  return breakdown;
}

function serializeRecentOrder(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,

    status: order.status,

    paymentStatus: order.paymentStatus,

    currency: order.currency,

    totalAmount: formatMoney(order.totalAmount),

    customer: {
      name: order.customerName,

      email: order.customerEmail,
    },

    deliveryLocation: {
      city: order.deliveryCity,

      governorate: order.deliveryGovernorate,
    },

    itemCount: order._count.items,

    createdAt: order.createdAt,
  };
}

function serializeInventoryItem(inventory) {
  return {
    id: inventory.id,

    stockQuantity: inventory.stockQuantity,

    lowStockThreshold: inventory.lowStockThreshold,

    updatedAt: inventory.updatedAt,

    variant: {
      id: inventory.variant.id,

      sku: inventory.variant.sku,

      displayName: inventory.variant.displayName,
    },

    product: {
      id: inventory.variant.product.id,

      name: inventory.variant.product.name,

      slug: inventory.variant.product.slug,

      category: inventory.variant.product.category,
    },
  };
}

export async function getAdminDashboard(period) {
  const startDate = getPeriodStartDate(period);

  const periodWhere = startDate
    ? {
        createdAt: {
          gte: startDate,
        },
      }
    : {};

  const nonCancelledOrderWhere = {
    ...periodWhere,

    status: {
      notIn: ["CANCELLED", "RETURNED"],
    },
  };

  const paidOrderWhere = {
    ...nonCancelledOrderWhere,
    paymentStatus: "PAID",
  };

  const [
    totalOrders,
    paidOrderCount,
    paidRevenueAggregate,
    grossOrderAggregate,
    orderStatusGroups,
    paymentStatusGroups,
    recentOrders,
    totalCustomers,
    newCustomers,
    productStatusGroups,
    activeCategories,
    activeVariants,
    inventoryRecords,
    topProductGroups,
  ] = await Promise.all([
    prisma.order.count({
      where: periodWhere,
    }),

    prisma.order.count({
      where: paidOrderWhere,
    }),

    prisma.order.aggregate({
      where: paidOrderWhere,

      _sum: {
        totalAmount: true,
      },
    }),

    prisma.order.aggregate({
      where: nonCancelledOrderWhere,

      _sum: {
        totalAmount: true,
      },
    }),

    prisma.order.groupBy({
      by: ["status"],

      where: periodWhere,

      _count: {
        _all: true,
      },
    }),

    prisma.order.groupBy({
      by: ["paymentStatus"],

      where: periodWhere,

      _count: {
        _all: true,
      },
    }),

    prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 8,

      select: recentOrderSelect,
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
        deletedAt: null,
      },
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
        deletedAt: null,
        ...periodWhere,
      },
    }),

    prisma.product.groupBy({
      by: ["status"],

      _count: {
        _all: true,
      },
    }),

    prisma.category.count({
      where: {
        isActive: true,
      },
    }),

    prisma.productVariant.count({
      where: {
        isActive: true,
        archivedAt: null,
      },
    }),

    prisma.inventory.findMany({
      orderBy: {
        stockQuantity: "asc",
      },

      select: inventorySelect,
    }),

    prisma.orderItem.groupBy({
      by: ["productId"],

      where: {
        order: paidOrderWhere,
      },

      _sum: {
        quantity: true,
        lineTotal: true,
      },

      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },

      take: 5,
    }),
  ]);

  const paidRevenue = new Prisma.Decimal(
    paidRevenueAggregate._sum.totalAmount ?? 0,
  );

  const grossOrderValue = new Prisma.Decimal(
    grossOrderAggregate._sum.totalAmount ?? 0,
  );

  const averagePaidOrderValue =
    paidOrderCount > 0
      ? paidRevenue.div(paidOrderCount)
      : new Prisma.Decimal(0);

  const lowStockRecords = inventoryRecords.filter(
    (inventory) => inventory.stockQuantity <= inventory.lowStockThreshold,
  );

  const outOfStockRecords = inventoryRecords.filter(
    (inventory) => inventory.stockQuantity === 0,
  );

  const topProductIds = topProductGroups
    .map((group) => group.productId)
    .filter(Boolean);

  const topProducts =
    topProductIds.length > 0
      ? await prisma.product.findMany({
          where: {
            id: {
              in: topProductIds,
            },
          },

          select: {
            id: true,
            name: true,
            slug: true,

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
          },
        })
      : [];

  const productById = new Map(
    topProducts.map((product) => [product.id, product]),
  );

  const serializedTopProducts = topProductGroups
    .filter((group) => group.productId)
    .map((group) => {
      const product = productById.get(group.productId);

      return {
        productId: group.productId,

        name: product?.name ?? "Unavailable product",

        slug: product?.slug ?? null,

        image: product?.images[0] ?? null,

        unitsSold: group._sum.quantity ?? 0,

        revenue: formatMoney(group._sum.lineTotal),
      };
    });

  return {
    period: {
      value: period,
      startDate,
      endDate: new Date(),
    },

    summary: {
      paidRevenue: formatMoney(paidRevenue),

      grossOrderValue: formatMoney(grossOrderValue),

      averagePaidOrderValue: formatMoney(averagePaidOrderValue),

      totalOrders,
      paidOrderCount,
      totalCustomers,
      newCustomers,

      activeProducts:
        productStatusGroups.find((group) => group.status === "ACTIVE")?._count
          ._all ?? 0,

      activeCategories,
      activeVariants,

      lowStockVariantCount: lowStockRecords.length,

      outOfStockVariantCount: outOfStockRecords.length,
    },

    orders: {
      total: totalOrders,

      byStatus: buildCountBreakdown(
        orderStatusGroups,
        ORDER_STATUSES,
        "status",
      ),

      byPaymentStatus: buildCountBreakdown(
        paymentStatusGroups,
        PAYMENT_STATUSES,
        "paymentStatus",
      ),
    },

    products: {
      byStatus: buildCountBreakdown(
        productStatusGroups,
        PRODUCT_STATUSES,
        "status",
      ),

      activeCategories,
      activeVariants,
    },

    inventory: {
      lowStockCount: lowStockRecords.length,

      outOfStockCount: outOfStockRecords.length,

      lowStockItems: lowStockRecords.slice(0, 10).map(serializeInventoryItem),
    },

    recentOrders: recentOrders.map(serializeRecentOrder),

    topProducts: serializedTopProducts,
  };
}
