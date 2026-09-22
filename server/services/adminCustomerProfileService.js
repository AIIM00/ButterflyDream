import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";

function decimal(value) {
  return new Prisma.Decimal(value ?? 0);
}

function formatMoney(value) {
  return decimal(value).toFixed(2);
}

function sortSpendGroups(groups) {
  return [...groups].sort((first, second) => {
    const spendComparison = decimal(second._sum.totalAmount).comparedTo(
      decimal(first._sum.totalAmount),
    );

    if (spendComparison !== 0) {
      return spendComparison;
    }

    const orderComparison =
      (second._count?._all ?? 0) - (first._count?._all ?? 0);

    if (orderComparison !== 0) {
      return orderComparison;
    }

    return String(first.userId ?? "").localeCompare(String(second.userId ?? ""));
  });
}

function buildFavoriteProducts(orderItems) {
  const productMap = new Map();

  for (const item of orderItems) {
    const key = item.productId ?? `snapshot:${item.productName}`;
    const current = productMap.get(key) ?? {
      productId: item.productId,
      name: item.productName,
      units: 0,
      revenue: new Prisma.Decimal(0),
      orderIds: new Set(),
      imageUrl: item.imageUrl ?? null,
    };

    current.units += item.quantity;
    current.revenue = current.revenue.plus(decimal(item.lineTotal));
    current.orderIds.add(item.orderId);
    current.imageUrl ||= item.imageUrl ?? null;

    productMap.set(key, current);
  }

  return [...productMap.values()]
    .sort((first, second) => {
      if (second.units !== first.units) {
        return second.units - first.units;
      }

      return second.revenue.comparedTo(first.revenue);
    })
    .slice(0, 5)
    .map((item, index) => ({
      rank: index + 1,
      productId: item.productId,
      name: item.name,
      units: item.units,
      orders: item.orderIds.size,
      revenue: formatMoney(item.revenue),
      imageUrl: item.imageUrl,
    }));
}

function buildFavoriteCategories(orderItems) {
  const categoryMap = new Map();

  for (const item of orderItems) {
    const category = item.product?.category;

    if (!category) {
      continue;
    }

    const current = categoryMap.get(category.id) ?? {
      id: category.id,
      name: category.name,
      units: 0,
      revenue: new Prisma.Decimal(0),
      orderIds: new Set(),
    };

    current.units += item.quantity;
    current.revenue = current.revenue.plus(decimal(item.lineTotal));
    current.orderIds.add(item.orderId);

    categoryMap.set(category.id, current);
  }

  return [...categoryMap.values()]
    .sort((first, second) => {
      const revenueComparison = second.revenue.comparedTo(first.revenue);

      if (revenueComparison !== 0) {
        return revenueComparison;
      }

      return second.units - first.units;
    })
    .slice(0, 5)
    .map((item, index) => ({
      rank: index + 1,
      categoryId: item.id,
      name: item.name,
      units: item.units,
      orders: item.orderIds.size,
      revenue: formatMoney(item.revenue),
    }));
}

function serializeOrder(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    currency: order.currency,
    subtotal: formatMoney(order.subtotal),
    deliveryFee: formatMoney(order.deliveryFee),
    discountAmount: formatMoney(order.discountAmount),
    totalAmount: formatMoney(order.totalAmount),
    deliveryLocation: {
      governorate: order.deliveryGovernorate,
      city: order.deliveryCity,
    },
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      unitPrice: formatMoney(item.unitPrice),
      lineTotal: formatMoney(item.lineTotal),
    })),
    createdAt: order.createdAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
  };
}

function buildTimeline(customer, orders) {
  const timeline = [
    {
      id: `customer-created-${customer.id}`,
      type: "ACCOUNT_CREATED",
      title: "Customer account created",
      description: `${customer.fullName} joined Butterfly Dream.`,
      createdAt: customer.createdAt,
    },
  ];

  if (customer.emailVerifiedAt) {
    timeline.push({
      id: `email-verified-${customer.id}`,
      type: "EMAIL_VERIFIED",
      title: "Email verified",
      description: customer.email,
      createdAt: customer.emailVerifiedAt,
    });
  }

  if (customer.lastLoginAt) {
    timeline.push({
      id: `last-login-${customer.id}`,
      type: "LAST_LOGIN",
      title: "Latest recorded login",
      description: "Most recent successful customer login.",
      createdAt: customer.lastLoginAt,
    });
  }

  for (const order of orders) {
    if (order.statusHistory.length === 0) {
      timeline.push({
        id: `order-created-${order.id}`,
        type: "ORDER_PLACED",
        title: `Order ${order.orderNumber} placed`,
        description: `${order.currency} ${formatMoney(order.totalAmount)}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
      });
      continue;
    }

    for (const event of order.statusHistory) {
      const isInitial = !event.fromStatus;

      timeline.push({
        id: event.id,
        type: isInitial ? "ORDER_PLACED" : "ORDER_STATUS_CHANGED",
        title: isInitial
          ? `Order ${order.orderNumber} placed`
          : `Order ${order.orderNumber}: ${event.toStatus.replaceAll("_", " ")}`,
        description:
          event.note ??
          (isInitial
            ? `${order.currency} ${formatMoney(order.totalAmount)}`
            : `${event.fromStatus?.replaceAll("_", " ") ?? "New"} → ${event.toStatus.replaceAll("_", " ")}`),
        orderId: order.id,
        orderNumber: order.orderNumber,
        changedBy: event.changedBy
          ? {
              id: event.changedBy.id,
              fullName: event.changedBy.fullName,
              role: event.changedBy.role,
            }
          : null,
        createdAt: event.createdAt,
      });
    }
  }

  return timeline.sort(
    (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
  );
}

export async function getAdminCustomerProfile(customerId) {
  const customer = await prisma.user.findFirst({
    where: {
      id: customerId,
      role: "CUSTOMER",
      deletedAt: null,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      status: true,
      emailVerifiedAt: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      addresses: {
        orderBy: [
          { isDefault: "desc" },
          { createdAt: "asc" },
        ],
        select: {
          id: true,
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
        },
      },
    },
  });

  if (!customer) {
    return null;
  }

  const [orders, deliveredSpendGroups, currencySetting] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId: customerId,
      },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        currency: true,
        subtotal: true,
        deliveryFee: true,
        discountAmount: true,
        totalAmount: true,
        deliveryGovernorate: true,
        deliveryCity: true,
        deliveredAt: true,
        cancelledAt: true,
        createdAt: true,
        items: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            orderId: true,
            productId: true,
            variantId: true,
            productName: true,
            variantName: true,
            sku: true,
            imageUrl: true,
            unitPrice: true,
            quantity: true,
            lineTotal: true,
            product: {
              select: {
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            note: true,
            createdAt: true,
            changedBy: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    }),

    prisma.order.groupBy({
      by: ["userId"],
      where: {
        userId: {
          not: null,
        },
        status: "DELIVERED",
      },
      _count: {
        _all: true,
      },
      _sum: {
        totalAmount: true,
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

  const customerOrders = orders;
  const deliveredOrders = customerOrders.filter(
    (order) => order.status === "DELIVERED",
  );
  const cancelledOrders = customerOrders.filter(
    (order) => order.status === "CANCELLED",
  );
  const returnedOrders = customerOrders.filter(
    (order) => order.status === "RETURNED",
  );
  const activeOrders = customerOrders.filter(
    (order) => !["DELIVERED", "CANCELLED", "RETURNED"].includes(order.status),
  );

  const lifetimeSpend = deliveredOrders.reduce(
    (total, order) => total.plus(decimal(order.totalAmount)),
    new Prisma.Decimal(0),
  );

  const averageOrderValue =
    deliveredOrders.length > 0
      ? lifetimeSpend.div(deliveredOrders.length)
      : new Prisma.Decimal(0);

  const deliveredItems = deliveredOrders.flatMap((order) => order.items);
  const rankedSpendGroups = sortSpendGroups(
    deliveredSpendGroups.filter((group) => group.userId),
  );
  const lifetimeRank =
    rankedSpendGroups.findIndex((group) => group.userId === customerId) + 1 || null;

  return {
    customer: {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      emailVerified: Boolean(customer.emailVerifiedAt),
      emailVerifiedAt: customer.emailVerifiedAt,
      lastLoginAt: customer.lastLoginAt,
      joinedAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    },
    summary: {
      totalOrders: customerOrders.length,
      deliveredOrders: deliveredOrders.length,
      activeOrders: activeOrders.length,
      cancelledOrders: cancelledOrders.length,
      returnedOrders: returnedOrders.length,
      lifetimeSpend: formatMoney(lifetimeSpend),
      averageOrderValue: formatMoney(averageOrderValue),
      lifetimeRank,
      firstOrderAt:
        customerOrders.length > 0
          ? customerOrders[customerOrders.length - 1].createdAt
          : null,
      lastOrderAt: customerOrders[0]?.createdAt ?? null,
    },
    addresses: customer.addresses,
    favoriteProducts: buildFavoriteProducts(deliveredItems),
    favoriteCategories: buildFavoriteCategories(deliveredItems),
    orders: customerOrders.map(serializeOrder),
    activity: buildTimeline(customer, customerOrders),
    currency: currencySetting?.currency ?? customerOrders[0]?.currency ?? "USD",
    generatedAt: new Date(),
  };
}
