import prisma from "../src/prisma.js";

const popupDetailSelect = {
  id: true,
  title: true,
  location: true,
  dateLabel: true,
  caption: true,
  status: true,
  commentsEnabled: true,
  position: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,

  images: {
    orderBy: {
      position: "asc",
    },

    select: {
      id: true,
      mediaAssetId: true,
      position: true,
      altText: true,

      mediaAsset: {
        select: {
          id: true,
          imageUrl: true,
          fileName: true,
          altText: true,
        },
      },
    },
  },

  _count: {
    select: {
      likes: true,
      attendances: true,
      comments: true,
    },
  },
};

function serializePopup(popup) {
  return {
    id: popup.id,

    title: popup.title,

    location: popup.location,

    dateLabel: popup.dateLabel,

    caption: popup.caption,

    status: popup.status,

    commentsEnabled: popup.commentsEnabled,

    position: popup.position,

    publishedAt: popup.publishedAt,

    createdAt: popup.createdAt,

    updatedAt: popup.updatedAt,

    images: popup.images.map((image) => ({
      id: image.id,

      mediaAssetId: image.mediaAssetId,

      position: image.position,

      altText: image.altText ?? image.mediaAsset.altText ?? "",

      imageUrl: image.mediaAsset.imageUrl,

      fileName: image.mediaAsset.fileName,
    })),

    social: {
      likeCount: popup._count.likes,

      attendanceCount: popup._count.attendances,

      commentCount: popup._count.comments,
    },
  };
}

async function validateMediaAssets(transaction, images) {
  if (!images || images.length === 0) {
    return true;
  }

  const ids = images.map((image) => image.mediaAssetId);

  const count = await transaction.mediaAsset.count({
    where: {
      id: {
        in: ids,
      },
    },
  });

  return count === ids.length;
}

async function replacePopupImages(transaction, popupEventId, images) {
  await transaction.popupEventImage.deleteMany({
    where: {
      popupEventId,
    },
  });

  if (images.length === 0) {
    return;
  }

  await transaction.popupEventImage.createMany({
    data: images.map((image) => ({
      popupEventId,

      mediaAssetId: image.mediaAssetId,

      position: image.position,

      altText: image.altText,
    })),
  });
}

export async function listAdminPopupEvents(filters) {
  const where = filters.status
    ? {
        status: filters.status,
      }
    : {};

  const skip = (filters.page - 1) * filters.limit;

  const [totalItems, popups] = await Promise.all([
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
          createdAt: "desc",
        },
      ],

      skip,

      take: filters.limit,

      select: popupDetailSelect,
    }),
  ]);

  const totalPages =
    totalItems === 0 ? 1 : Math.ceil(totalItems / filters.limit);

  return {
    popupEvents: popups.map(serializePopup),

    pagination: {
      page: filters.page,

      limit: filters.limit,

      totalItems,

      totalPages,

      hasPreviousPage: filters.page > 1,

      hasNextPage: filters.page < totalPages,
    },
  };
}

export async function getAdminPopupEventById(popupEventId) {
  const popup = await prisma.popupEvent.findUnique({
    where: {
      id: popupEventId,
    },

    select: popupDetailSelect,
  });

  return popup ? serializePopup(popup) : null;
}

export async function createAdminPopupEvent(adminUserId, input) {
  return prisma.$transaction(async (transaction) => {
    const assetsValid = await validateMediaAssets(transaction, input.images);

    if (!assetsValid) {
      return {
        status: "MEDIA_NOT_FOUND",
      };
    }

    const lastPopup = await transaction.popupEvent.findFirst({
      orderBy: {
        position: "desc",
      },

      select: {
        position: true,
      },
    });

    const position = (lastPopup?.position ?? -1) + 1;

    const popup = await transaction.popupEvent.create({
      data: {
        title: input.title,

        location: input.location,

        dateLabel: input.dateLabel,

        caption: input.caption,

        commentsEnabled: input.commentsEnabled,

        createdByUserId: adminUserId,

        position,
      },

      select: {
        id: true,
      },
    });

    await replacePopupImages(transaction, popup.id, input.images);

    const created = await transaction.popupEvent.findUnique({
      where: {
        id: popup.id,
      },

      select: popupDetailSelect,
    });

    return {
      status: "CREATED",

      popupEvent: serializePopup(created),
    };
  });
}

export async function updateAdminPopupEvent(popupEventId, input) {
  return prisma.$transaction(async (transaction) => {
    const existing = await transaction.popupEvent.findUnique({
      where: {
        id: popupEventId,
      },

      select: {
        id: true,
      },
    });

    if (!existing) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (input.images !== undefined) {
      const assetsValid = await validateMediaAssets(transaction, input.images);

      if (!assetsValid) {
        return {
          status: "MEDIA_NOT_FOUND",
        };
      }
    }

    const { images, ...data } = input;

    if (Object.keys(data).length > 0) {
      await transaction.popupEvent.update({
        where: {
          id: popupEventId,
        },

        data,
      });
    }

    if (images !== undefined) {
      await replacePopupImages(transaction, popupEventId, images);
    }

    const updated = await transaction.popupEvent.findUnique({
      where: {
        id: popupEventId,
      },

      select: popupDetailSelect,
    });

    return {
      status: "UPDATED",

      popupEvent: serializePopup(updated),
    };
  });
}

export async function updateAdminPopupEventStatus(popupEventId, status) {
  return prisma.$transaction(async (transaction) => {
    const existing = await transaction.popupEvent.findUnique({
      where: {
        id: popupEventId,
      },

      select: {
        id: true,
        title: true,
        caption: true,

        _count: {
          select: {
            images: true,
          },
        },
      },
    });

    if (!existing) {
      return {
        status: "NOT_FOUND",
      };
    }

    if (status === "PUBLISHED") {
      if (!existing.title.trim() || !existing.caption.trim()) {
        return {
          status: "INCOMPLETE",
        };
      }

      if (existing._count.images < 1) {
        return {
          status: "NO_IMAGES",
        };
      }
    }

    const updated = await transaction.popupEvent.update({
      where: {
        id: popupEventId,
      },

      data: {
        status,

        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },

      select: popupDetailSelect,
    });

    return {
      status: "UPDATED",

      popupEvent: serializePopup(updated),
    };
  });
}

export async function reorderAdminPopupEvents(ids) {
  return prisma.$transaction(async (transaction) => {
    const existing = await transaction.popupEvent.findMany({
      where: {
        id: {
          in: ids,
        },
      },

      select: {
        id: true,
      },
    });

    if (existing.length !== ids.length) {
      return {
        status: "NOT_FOUND",
      };
    }

    await Promise.all(
      ids.map((id, position) =>
        transaction.popupEvent.update({
          where: {
            id,
          },

          data: {
            position,
          },
        }),
      ),
    );

    const popups = await transaction.popupEvent.findMany({
      orderBy: [
        {
          position: "asc",
        },
        {
          createdAt: "desc",
        },
      ],

      select: popupDetailSelect,
    });

    return {
      status: "UPDATED",

      popupEvents: popups.map(serializePopup),
    };
  });
}

export async function deleteAdminPopupComment(commentId) {
  const existing = await prisma.popupEventComment.findUnique({
    where: {
      id: commentId,
    },

    select: {
      id: true,
      popupEventId: true,
    },
  });

  if (!existing) {
    return {
      status: "NOT_FOUND",
    };
  }

  return prisma.$transaction(async (transaction) => {
    await transaction.popupEventComment.delete({
      where: {
        id: commentId,
      },
    });

    const commentCount = await transaction.popupEventComment.count({
      where: {
        popupEventId: existing.popupEventId,
      },
    });

    return {
      status: "DELETED",

      popupEventId: existing.popupEventId,

      commentCount,
    };
  });
}
