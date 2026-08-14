import prisma from "../src/prisma.js";

const commentSelect = {
  id: true,
  body: true,
  createdAt: true,
  updatedAt: true,

  user: {
    select: {
      id: true,
      fullName: true,
    },
  },
};

function serializeComment(comment) {
  return {
    id: comment.id,

    body: comment.body,

    createdAt: comment.createdAt,

    updatedAt: comment.updatedAt,

    user: {
      id: comment.user.id,

      fullName: comment.user.fullName ?? "Customer",
    },
  };
}

function serializePopupEvent(event) {
  const recentComments = [...(event.comments ?? [])]
    .reverse()
    .map(serializeComment);

  return {
    id: event.id,

    title: event.title,

    location: event.location,

    dateLabel: event.dateLabel,

    caption: event.caption,

    commentsEnabled: event.commentsEnabled,

    publishedAt: event.publishedAt,

    images: event.images.map((image) => ({
      id: image.id,

      position: image.position,

      altText: image.altText ?? image.mediaAsset.altText ?? event.title,

      mediaAssetId: image.mediaAsset.id,

      imageUrl: image.mediaAsset.imageUrl,
    })),

    social: {
      likeCount: event._count.likes,

      attendanceCount: event._count.attendances,

      commentCount: event._count.comments,
    },

    recentComments,
  };
}

const publicPopupSelect = {
  id: true,
  title: true,
  location: true,
  dateLabel: true,
  caption: true,
  commentsEnabled: true,
  publishedAt: true,

  images: {
    orderBy: {
      position: "asc",
    },

    select: {
      id: true,
      position: true,
      altText: true,

      mediaAsset: {
        select: {
          id: true,
          imageUrl: true,
          altText: true,
        },
      },
    },
  },

  comments: {
    orderBy: {
      createdAt: "desc",
    },

    take: 3,

    select: commentSelect,
  },

  _count: {
    select: {
      likes: true,
      attendances: true,
      comments: true,
    },
  },
};

export async function getPublicPopupEvents(query) {
  const where = {
    status: "PUBLISHED",
  };

  const skip = (query.page - 1) * query.limit;

  const [totalItems, events] = await Promise.all([
    prisma.popupEvent.count({
      where,
    }),

    prisma.popupEvent.findMany({
      where,

      orderBy: [
        {
          position: "asc",
        },
        {
          publishedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],

      skip,

      take: query.limit,

      select: publicPopupSelect,
    }),
  ]);

  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / query.limit);

  return {
    popupEvents: events.map(serializePopupEvent),

    pagination: {
      page: query.page,

      limit: query.limit,

      totalItems,

      totalPages,

      hasPreviousPage: query.page > 1,

      hasNextPage: query.page < totalPages,
    },
  };
}

export async function getPublicPopupComments(popupEventId, query) {
  const event = await prisma.popupEvent.findFirst({
    where: {
      id: popupEventId,

      status: "PUBLISHED",
    },

    select: {
      id: true,
      commentsEnabled: true,
    },
  });

  if (!event) {
    return {
      status: "NOT_FOUND",
    };
  }

  const skip = (query.page - 1) * query.limit;

  const where = {
    popupEventId,
  };

  const [totalItems, comments] = await Promise.all([
    prisma.popupEventComment.count({
      where,
    }),

    prisma.popupEventComment.findMany({
      where,

      orderBy: {
        createdAt: "asc",
      },

      skip,

      take: query.limit,

      select: commentSelect,
    }),
  ]);

  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / query.limit);

  return {
    status: "FOUND",

    commentsEnabled: event.commentsEnabled,

    comments: comments.map(serializeComment),

    pagination: {
      page: query.page,

      limit: query.limit,

      totalItems,

      totalPages,

      hasPreviousPage: query.page > 1,

      hasNextPage: query.page < totalPages,
    },
  };
}

export async function getCustomerPopupInteractions(userId, popupEventIds) {
  if (popupEventIds.length === 0) {
    return {
      interactions: {},
    };
  }

  const events = await prisma.popupEvent.findMany({
    where: {
      id: {
        in: popupEventIds,
      },

      status: "PUBLISHED",
    },

    select: {
      id: true,

      likes: {
        where: {
          userId,
        },

        select: {
          id: true,
        },

        take: 1,
      },

      attendances: {
        where: {
          userId,
        },

        select: {
          id: true,
        },

        take: 1,
      },
    },
  });

  const interactions = {};

  for (const event of events) {
    interactions[event.id] = {
      liked: event.likes.length > 0,

      attended: event.attendances.length > 0,
    };
  }

  return {
    interactions,
  };
}

async function findPublishedPopupEvent(transaction, popupEventId) {
  return transaction.popupEvent.findFirst({
    where: {
      id: popupEventId,

      status: "PUBLISHED",
    },

    select: {
      id: true,
      commentsEnabled: true,
    },
  });
}

export async function likePopupEvent(userId, popupEventId) {
  return prisma.$transaction(async (transaction) => {
    const event = await findPublishedPopupEvent(transaction, popupEventId);

    if (!event) {
      return {
        status: "NOT_FOUND",
      };
    }

    const existing = await transaction.popupEventLike.findUnique({
      where: {
        popupEventId_userId: {
          popupEventId,
          userId,
        },
      },

      select: {
        id: true,
      },
    });

    if (!existing) {
      await transaction.popupEventLike.create({
        data: {
          popupEventId,
          userId,
        },
      });
    }

    const likeCount = await transaction.popupEventLike.count({
      where: {
        popupEventId,
      },
    });

    return {
      status: existing ? "ALREADY_LIKED" : "LIKED",

      liked: true,

      likeCount,
    };
  });
}

export async function unlikePopupEvent(userId, popupEventId) {
  return prisma.$transaction(async (transaction) => {
    const event = await findPublishedPopupEvent(transaction, popupEventId);

    if (!event) {
      return {
        status: "NOT_FOUND",
      };
    }

    await transaction.popupEventLike.deleteMany({
      where: {
        popupEventId,
        userId,
      },
    });

    const likeCount = await transaction.popupEventLike.count({
      where: {
        popupEventId,
      },
    });

    return {
      status: "UNLIKED",

      liked: false,

      likeCount,
    };
  });
}

export async function confirmPopupAttendance(userId, popupEventId) {
  return prisma.$transaction(async (transaction) => {
    const event = await findPublishedPopupEvent(transaction, popupEventId);

    if (!event) {
      return {
        status: "NOT_FOUND",
      };
    }

    const existing = await transaction.popupEventAttendance.findUnique({
      where: {
        popupEventId_userId: {
          popupEventId,
          userId,
        },
      },

      select: {
        id: true,
      },
    });

    if (!existing) {
      await transaction.popupEventAttendance.create({
        data: {
          popupEventId,
          userId,
        },
      });
    }

    const attendanceCount = await transaction.popupEventAttendance.count({
      where: {
        popupEventId,
      },
    });

    return {
      status: existing ? "ALREADY_CONFIRMED" : "CONFIRMED",

      attended: true,

      attendanceCount,
    };
  });
}

export async function removePopupAttendance(userId, popupEventId) {
  return prisma.$transaction(async (transaction) => {
    const event = await findPublishedPopupEvent(transaction, popupEventId);

    if (!event) {
      return {
        status: "NOT_FOUND",
      };
    }

    await transaction.popupEventAttendance.deleteMany({
      where: {
        popupEventId,
        userId,
      },
    });

    const attendanceCount = await transaction.popupEventAttendance.count({
      where: {
        popupEventId,
      },
    });

    return {
      status: "REMOVED",

      attended: false,

      attendanceCount,
    };
  });
}

export async function createPopupComment(userId, popupEventId, body) {
  return prisma.$transaction(async (transaction) => {
    const event = await findPublishedPopupEvent(transaction, popupEventId);

    if (!event) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (!event.commentsEnabled) {
      return {
        status: "COMMENTS_DISABLED",
      };
    }

    const comment = await transaction.popupEventComment.create({
      data: {
        popupEventId,
        userId,
        body,
      },

      select: commentSelect,
    });

    const commentCount = await transaction.popupEventComment.count({
      where: {
        popupEventId,
      },
    });

    return {
      status: "CREATED",

      comment: serializeComment(comment),

      commentCount,
    };
  });
}

export async function deleteOwnPopupComment(userId, commentId) {
  const comment = await prisma.popupEventComment.findFirst({
    where: {
      id: commentId,

      userId,
    },

    select: {
      id: true,
      popupEventId: true,
    },
  });

  if (!comment) {
    return {
      status: "NOT_FOUND",
    };
  }

  return prisma.$transaction(async (transaction) => {
    await transaction.popupEventComment.delete({
      where: {
        id: comment.id,
      },
    });

    const commentCount = await transaction.popupEventComment.count({
      where: {
        popupEventId: comment.popupEventId,
      },
    });

    return {
      status: "DELETED",

      popupEventId: comment.popupEventId,

      commentCount,
    };
  });
}
