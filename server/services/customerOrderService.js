import { Prisma } from "@prisma/client";
import prisma from "../src/prisma.js";

const orderListSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentMethod: true,
  paymentStatus: true,
  currency: true,
  subtotal: true,
  deliveryFee: true,
  discountAmount: true,
  totalAmount: true,
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
};

function formatMoney(value) {
  return new Prisma.Decimal(value).toFixed(2);
}

function serializeOrderListItem(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    currency: order.currency,

    subtotal: formatMoney(order.subtotal),

    deliveryFee: formatMoney(order.deliveryFee),

    discountAmount: formatMoney(order.discountAmount),

    totalAmount: formatMoney(order.totalAmount),

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

export async function getCustomerOrders(userId, query) {
  const where = {
    userId,

    ...(query.status
      ? {
          status: query.status,
        }
      : {}),
  };

  const orderBy = {
    createdAt: query.sort === "oldest" ? "asc" : "desc",
  };

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
      status: query.status,
      sort: query.sort,
    },
  };
}

export async function getCustomerOrderById(userId, orderId) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },

    select: orderDetailSelect,
  });

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
