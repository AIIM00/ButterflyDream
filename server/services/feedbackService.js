import prisma from "../src/prisma.js";

const FEEDBACKS_PER_PAGE = 4;

function createPublicCustomerName(fullName) {
  if (typeof fullName !== "string") {
    return "Butterfly Dream customer";
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "Butterfly Dream customer";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];

  return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
}

function serializePublicFeedback(feedback) {
  return {
    id: feedback.id,
    rating: feedback.rating,
    comment: feedback.comment,
    customerName: createPublicCustomerName(feedback.user?.fullName),
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
  };
}

function serializeCustomerFeedback(feedback) {
  if (!feedback) {
    return null;
  }

  return {
    id: feedback.id,
    rating: feedback.rating,
    comment: feedback.comment,
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
  };
}

export async function listPublicFeedback(page = 1) {
  const skip = (page - 1) * FEEDBACKS_PER_PAGE;

  const where = {
    user: {
      is: {
        role: "CUSTOMER",
        status: "ACTIVE",
        deletedAt: null,
      },
    },
  };

  const [feedbacks, totalFeedbacks, ratingSummary] = await prisma.$transaction([
    prisma.feedback.findMany({
      where,

      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            fullName: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: FEEDBACKS_PER_PAGE,
    }),

    prisma.feedback.count({
      where,
    }),

    prisma.feedback.aggregate({
      where,

      _avg: {
        rating: true,
      },
    }),
  ]);

  const totalPages =
    totalFeedbacks === 0 ? 0 : Math.ceil(totalFeedbacks / FEEDBACKS_PER_PAGE);

  return {
    feedbacks: feedbacks.map(serializePublicFeedback),

    summary: {
      averageRating:
        ratingSummary._avg.rating === null
          ? 0
          : Number(ratingSummary._avg.rating.toFixed(1)),

      totalFeedbacks,
    },

    pagination: {
      page,
      limit: FEEDBACKS_PER_PAGE,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}

export async function getCustomerFeedback(userId) {
  const feedback = await prisma.feedback.findUnique({
    where: {
      userId,
    },

    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return serializeCustomerFeedback(feedback);
}

export async function createCustomerFeedback(userId, data) {
  const feedback = await prisma.feedback.create({
    data: {
      userId,
      rating: data.rating,
      comment: data.comment,
    },

    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return serializeCustomerFeedback(feedback);
}

export async function updateCustomerFeedback(userId, data) {
  const feedback = await prisma.feedback.update({
    where: {
      userId,
    },

    data: {
      rating: data.rating,
      comment: data.comment,
    },

    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return serializeCustomerFeedback(feedback);
}
