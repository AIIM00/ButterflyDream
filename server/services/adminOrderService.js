import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";

const STATUS_TRANSITIONS = {
  PENDING: new Set(["CONFIRMED"]),

  CONFIRMED: new Set(["PROCESSING"]),

  PROCESSING: new Set(["READY_FOR_DELIVERY"]),

  READY_FOR_DELIVERY: new Set(["OUT_FOR_DELIVERY"]),

  OUT_FOR_DELIVERY: new Set(["DELIVERED"]),

  DELIVERED: new Set(["RETURNED"]),

  CANCELLED: new Set(),
  RETURNED: new Set(),
};

const CANCELLABLE_STATUSES = new Set([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
]);

const PAYMENT_TRANSITIONS = {
  UNPAID: new Set(["PAID", "FAILED"]),

  FAILED: new Set(["UNPAID", "PAID"]),

  PAID: new Set(["REFUNDED"]),

  REFUNDED: new Set(),
};

const orderListSelect = {
  id: true,
  orderNumber: true,
  userId: true,
  status: true,
  paymentMethod: true,
  paymentStatus: true,
  currency: true,

  subtotal: true,
  deliveryFee: true,
  discountAmount: true,
  totalAmount: true,

  customerName: true,
  customerEmail: true,
  customerPhone: true,

  deliveryGovernorate: true,
  deliveryCity: true,

  cancelledAt: true,
  deliveredAt: true,
  createdAt: true,
  updatedAt: true,

  items: {
    orderBy: {
      createdAt: "asc",
    },

    take: 4,

    select: {
      id: true,
      productName: true,
      variantName: true,
      imageUrl: true,
      quantity: true,
      unitPrice: true,
      lineTotal: true,
    },
  },

  _count: {
    select: {
      items: true,
    },
  },
};

const orderDetailSelect = {
  id: true,
  orderNumber: true,
  userId: true,
  status: true,
  paymentMethod: true,
  paymentStatus: true,
  currency: true,

  subtotal: true,
  deliveryFee: true,
  discountAmount: true,
  totalAmount: true,

  customerNote: true,
  adminNote: true,

  customerName: true,
  customerEmail: true,
  customerPhone: true,

  deliveryRecipientName: true,
  deliveryPhone: true,
  deliveryGovernorate: true,
  deliveryCity: true,
  deliveryStreet: true,
  deliveryBuilding: true,
  deliveryFloor: true,
  deliveryLandmark: true,
  deliveryNotes: true,

  cancelledAt: true,
  cancellationReason: true,
  deliveredAt: true,
  createdAt: true,
  updatedAt: true,

  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
    },
  },

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
      options: true,
      imageUrl: true,
      unitPrice: true,
      quantity: true,
      lineTotal: true,
      createdAt: true,
    },
  },

  statusHistory: {
    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      orderId: true,
      changedByUserId: true,
      fromStatus: true,
      toStatus: true,
      note: true,
      createdAt: true,

      changedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
  },
};

const orderMutationSelect = {
  id: true,
  orderNumber: true,
  userId: true,
  status: true,
  paymentStatus: true,

  items: {
    select: {
      id: true,
      variantId: true,
      quantity: true,
    },
  },
};

function formatMoney(value) {
  return new Prisma.Decimal(value).toFixed(2);
}

function formatStatusLabel(status) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function serializeOrderListItem(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    currency: order.currency,

    subtotal: formatMoney(order.subtotal),
    deliveryFee: formatMoney(order.deliveryFee),
    discountAmount: formatMoney(order.discountAmount),
    totalAmount: formatMoney(order.totalAmount),

    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
    },

    deliveryLocation: {
      governorate: order.deliveryGovernorate,
      city: order.deliveryCity,
    },

    itemCount: order._count.items,

    previewItems: order.items.map((item) => ({
      ...item,
      unitPrice: formatMoney(item.unitPrice),
      lineTotal: formatMoney(item.lineTotal),
    })),

    cancelledAt: order.cancelledAt,
    deliveredAt: order.deliveredAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function serializeOrderDetail(order) {
  return {
    ...order,

    subtotal: formatMoney(order.subtotal),
    deliveryFee: formatMoney(order.deliveryFee),
    discountAmount: formatMoney(order.discountAmount),
    totalAmount: formatMoney(order.totalAmount),

    items: order.items.map((item) => ({
      ...item,
      unitPrice: formatMoney(item.unitPrice),
      lineTotal: formatMoney(item.lineTotal),
    })),
  };
}

function getOrderById(database, orderId) {
  return database.order.findUnique({
    where: {
      id: orderId,
    },

    select: orderDetailSelect,
  });
}

async function restoreInventoryForOrderItems(transaction, items) {
  const quantityByVariantId = new Map();

  for (const item of items) {
    if (!item.variantId) {
      continue;
    }

    const currentQuantity = quantityByVariantId.get(item.variantId) ?? 0;

    quantityByVariantId.set(item.variantId, currentQuantity + item.quantity);
  }

  for (const [variantId, quantity] of quantityByVariantId.entries()) {
    await transaction.inventory.upsert({
      where: {
        variantId,
      },

      update: {
        stockQuantity: {
          increment: quantity,
        },
      },

      create: {
        variantId,
        stockQuantity: quantity,
        lowStockThreshold: 5,
      },
    });
  }
}

function getStatusNotification(status) {
  switch (status) {
    case "CONFIRMED":
      return {
        type: "ORDER_CONFIRMED",
        title: "Order confirmed",
        message: "Your order has been confirmed and will be prepared soon.",
      };

    case "DELIVERED":
      return {
        type: "ORDER_DELIVERED",
        title: "Order delivered",
        message: "Your order has been marked as delivered.",
      };

    case "CANCELLED":
      return {
        type: "ORDER_CANCELLED",
        title: "Order cancelled",
        message: "Your order has been cancelled.",
      };

    default:
      return {
        type: "ORDER_STATUS_CHANGED",
        title: "Order status updated",
        message: `Your order status is now ${formatStatusLabel(status)}.`,
      };
  }
}

async function createStatusNotification(
  transaction,
  { userId, orderId, orderNumber, status },
) {
  if (!userId) {
    return;
  }

  const notification = getStatusNotification(status);

  await transaction.notification.create({
    data: {
      userId,
      orderId,
      type: notification.type,
      title: notification.title,
      message: `${notification.message} Order ${orderNumber}.`,

      data: {
        orderNumber,
        status,
      },
    },
  });
}

async function createPaymentNotification(
  transaction,
  { userId, orderId, orderNumber, paymentStatus, note },
) {
  if (!userId) {
    return;
  }

  const paymentLabel = formatStatusLabel(paymentStatus);

  await transaction.notification.create({
    data: {
      userId,
      orderId,
      type: "SYSTEM",
      title: "Payment status updated",
      message: `Payment for order ${orderNumber} is now ${paymentLabel}.`,

      data: {
        orderNumber,
        paymentStatus,
        note,
      },
    },
  });
}

export async function getAdminOrders(query) {
  const where = {
    ...(query.status
      ? {
          status: query.status,
        }
      : {}),

    ...(query.paymentStatus
      ? {
          paymentStatus: query.paymentStatus,
        }
      : {}),

    ...(query.search
      ? {
          OR: [
            {
              orderNumber: {
                contains: query.search,
                mode: "insensitive",
              },
            },
            {
              customerName: {
                contains: query.search,
                mode: "insensitive",
              },
            },
            {
              customerEmail: {
                contains: query.search,
                mode: "insensitive",
              },
            },
            {
              customerPhone: {
                contains: query.search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const orderBy = (() => {
    switch (query.sort) {
      case "oldest":
        return {
          createdAt: "asc",
        };

      case "total_asc":
        return {
          totalAmount: "asc",
        };

      case "total_desc":
        return {
          totalAmount: "desc",
        };

      case "newest":
      default:
        return {
          createdAt: "desc",
        };
    }
  })();

  const skip = (query.page - 1) * query.limit;

  const [totalItems, orders] = await Promise.all([
    prisma.order.count({
      where,
    }),

    prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      select: orderListSelect,
    }),
  ]);

  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / query.limit);

  return {
    orders: orders.map(serializeOrderListItem),

    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages,

      hasPreviousPage: query.page > 1,

      hasNextPage: query.page < totalPages,
    },

    filters: {
      search: query.search || null,

      status: query.status,

      paymentStatus: query.paymentStatus,

      sort: query.sort,
    },
  };
}

export async function getAdminOrderById(orderId) {
  const order = await getOrderById(prisma, orderId);

  if (!order) {
    return {
      status: "NOT_FOUND",
    };
  }

  return {
    status: "FOUND",

    order: serializeOrderDetail(order),
  };
}

export async function updateAdminOrderStatus(adminUserId, orderId, input) {
  return prisma.$transaction(async (transaction) => {
    const existingOrder = await transaction.order.findUnique({
      where: {
        id: orderId,
      },

      select: orderMutationSelect,
    });

    if (!existingOrder) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (existingOrder.status === input.status) {
      const order = await getOrderById(transaction, orderId);

      return {
        status: "UNCHANGED",

        order: serializeOrderDetail(order),
      };
    }

    const allowedStatuses =
      STATUS_TRANSITIONS[existingOrder.status] ?? new Set();

    if (!allowedStatuses.has(input.status)) {
      return {
        status: "INVALID_TRANSITION",

        currentStatus: existingOrder.status,

        requestedStatus: input.status,

        allowedStatuses: [...allowedStatuses],
      };
    }

    if (input.status === "RETURNED") {
      await restoreInventoryForOrderItems(transaction, existingOrder.items);
    }

    const changedAt = new Date();

    await transaction.order.update({
      where: {
        id: orderId,
      },

      data: {
        status: input.status,

        ...(input.status === "DELIVERED"
          ? {
              deliveredAt: changedAt,
            }
          : {}),
      },
    });

    await transaction.orderStatusHistory.create({
      data: {
        orderId,
        changedByUserId: adminUserId,

        fromStatus: existingOrder.status,

        toStatus: input.status,

        note: input.note,
      },
    });

    await createStatusNotification(transaction, {
      userId: existingOrder.userId,

      orderId,

      orderNumber: existingOrder.orderNumber,

      status: input.status,
    });

    const order = await getOrderById(transaction, orderId);

    return {
      status: "UPDATED",

      order: serializeOrderDetail(order),
    };
  });
}

export async function cancelAdminOrder(adminUserId, orderId, reason) {
  return prisma.$transaction(async (transaction) => {
    const existingOrder = await transaction.order.findUnique({
      where: {
        id: orderId,
      },

      select: orderMutationSelect,
    });

    if (!existingOrder) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (existingOrder.status === "CANCELLED") {
      const order = await getOrderById(transaction, orderId);

      return {
        status: "ALREADY_CANCELLED",

        order: serializeOrderDetail(order),
      };
    }

    if (!CANCELLABLE_STATUSES.has(existingOrder.status)) {
      return {
        status: "CANNOT_CANCEL",

        currentStatus: existingOrder.status,
      };
    }

    await restoreInventoryForOrderItems(transaction, existingOrder.items);

    const cancelledAt = new Date();

    await transaction.order.update({
      where: {
        id: orderId,
      },

      data: {
        status: "CANCELLED",
        cancelledAt,
        cancellationReason: reason,
      },
    });

    await transaction.orderStatusHistory.create({
      data: {
        orderId,
        changedByUserId: adminUserId,

        fromStatus: existingOrder.status,

        toStatus: "CANCELLED",

        note: reason,
      },
    });

    await createStatusNotification(transaction, {
      userId: existingOrder.userId,

      orderId,

      orderNumber: existingOrder.orderNumber,

      status: "CANCELLED",
    });

    const order = await getOrderById(transaction, orderId);

    return {
      status: "CANCELLED",

      order: serializeOrderDetail(order),
    };
  });
}

export async function updateAdminOrderNote(orderId, adminNote) {
  const existingOrder = await prisma.order.findUnique({
    where: {
      id: orderId,
    },

    select: {
      id: true,
    },
  });

  if (!existingOrder) {
    return {
      status: "NOT_FOUND",
    };
  }

  const order = await prisma.order.update({
    where: {
      id: orderId,
    },

    data: {
      adminNote,
    },

    select: orderDetailSelect,
  });

  return {
    status: "UPDATED",

    order: serializeOrderDetail(order),
  };
}

export async function updateAdminOrderPayment(orderId, input) {
  return prisma.$transaction(async (transaction) => {
    const existingOrder = await transaction.order.findUnique({
      where: {
        id: orderId,
      },

      select: {
        id: true,
        orderNumber: true,
        userId: true,
        paymentStatus: true,
      },
    });

    if (!existingOrder) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (existingOrder.paymentStatus === input.paymentStatus) {
      const order = await getOrderById(transaction, orderId);

      return {
        status: "UNCHANGED",

        order: serializeOrderDetail(order),
      };
    }

    const allowedStatuses =
      PAYMENT_TRANSITIONS[existingOrder.paymentStatus] ?? new Set();

    if (!allowedStatuses.has(input.paymentStatus)) {
      return {
        status: "INVALID_PAYMENT_TRANSITION",

        currentPaymentStatus: existingOrder.paymentStatus,

        requestedPaymentStatus: input.paymentStatus,

        allowedPaymentStatuses: [...allowedStatuses],
      };
    }

    await transaction.order.update({
      where: {
        id: orderId,
      },

      data: {
        paymentStatus: input.paymentStatus,
      },
    });

    await createPaymentNotification(transaction, {
      userId: existingOrder.userId,

      orderId,

      orderNumber: existingOrder.orderNumber,

      paymentStatus: input.paymentStatus,

      note: input.note,
    });

    const order = await getOrderById(transaction, orderId);

    return {
      status: "UPDATED",

      order: serializeOrderDetail(order),
    };
  });
}
