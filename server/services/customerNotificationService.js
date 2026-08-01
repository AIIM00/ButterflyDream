import prisma from "../src/prisma.js";

const notificationSelect = {
  id: true,
  userId: true,
  orderId: true,
  type: true,
  title: true,
  message: true,
  data: true,
  readAt: true,
  createdAt: true,

  order: {
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      currency: true,
      createdAt: true,
    },
  },
};

function serializeNotification(notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,

    // The frontend can continue using notification.isRead.
    isRead: notification.readAt !== null,

    readAt: notification.readAt,
    createdAt: notification.createdAt,

    order: notification.order
      ? {
          id: notification.order.id,
          orderNumber: notification.order.orderNumber,
          status: notification.order.status,
          paymentStatus: notification.order.paymentStatus,
          totalAmount: notification.order.totalAmount.toFixed(2),
          currency: notification.order.currency,
          createdAt: notification.order.createdAt,
        }
      : null,
  };
}

function buildNotificationWhere(userId, query) {
  return {
    userId,

    ...(query.status === "unread"
      ? {
          readAt: null,
        }
      : {}),

    ...(query.status === "read"
      ? {
          readAt: {
            not: null,
          },
        }
      : {}),

    ...(query.type
      ? {
          type: query.type,
        }
      : {}),
  };
}

export async function getCustomerNotifications(userId, query) {
  const where = buildNotificationWhere(userId, query);

  const skip = (query.page - 1) * query.limit;

  const [totalItems, unreadCount, notifications] = await Promise.all([
    prisma.notification.count({
      where,
    }),

    prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    }),

    prisma.notification.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: query.limit,

      select: notificationSelect,
    }),
  ]);

  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / query.limit);

  return {
    notifications: notifications.map(serializeNotification),

    unreadCount,

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
      type: query.type,
    },
  };
}

export async function getCustomerUnreadNotificationCount(userId) {
  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });

  return {
    unreadCount,
  };
}

export async function markCustomerNotificationAsRead(userId, notificationId) {
  return prisma.$transaction(async (transaction) => {
    const notification = await transaction.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },

      select: notificationSelect,
    });

    if (!notification) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (notification.readAt !== null) {
      const unreadCount = await transaction.notification.count({
        where: {
          userId,
          readAt: null,
        },
      });

      return {
        status: "ALREADY_READ",
        notification: serializeNotification(notification),
        unreadCount,
      };
    }

    const updatedNotification = await transaction.notification.update({
      where: {
        id: notificationId,
      },

      data: {
        readAt: new Date(),
      },

      select: notificationSelect,
    });

    const unreadCount = await transaction.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return {
      status: "READ",
      notification: serializeNotification(updatedNotification),
      unreadCount,
    };
  });
}

export async function markAllCustomerNotificationsAsRead(userId) {
  const readAt = new Date();

  const result = await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },

    data: {
      readAt,
    },
  });

  return {
    updatedCount: result.count,
    unreadCount: 0,
  };
}

export async function deleteCustomerNotification(userId, notificationId) {
  return prisma.$transaction(async (transaction) => {
    const notification = await transaction.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },

      select: {
        id: true,
      },
    });

    if (!notification) {
      return {
        status: "NOT_FOUND",
      };
    }

    await transaction.notification.delete({
      where: {
        id: notificationId,
      },
    });

    const unreadCount = await transaction.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return {
      status: "DELETED",
      unreadCount,
    };
  });
}

export async function deleteReadCustomerNotifications(userId) {
  const result = await prisma.notification.deleteMany({
    where: {
      userId,

      readAt: {
        not: null,
      },
    },
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });

  return {
    deletedCount: result.count,
    unreadCount,
  };
}
