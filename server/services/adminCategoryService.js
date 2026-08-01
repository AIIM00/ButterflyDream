import prisma from "../src/prisma.js";

const categoryAdminSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  isActive: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,

  _count: {
    select: {
      products: true,
    },
  },
};

function serializeAdminCategory(category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    isActive: category.isActive,
    displayOrder: category.displayOrder,
    productCount: category._count.products,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export async function listAdminCategories() {
  const categories = await prisma.category.findMany({
    orderBy: [
      {
        displayOrder: "asc",
      },
      {
        name: "asc",
      },
    ],

    select: categoryAdminSelect,
  });

  return categories.map(serializeAdminCategory);
}

export async function findCategoryById(categoryId, database = prisma) {
  return database.category.findUnique({
    where: {
      id: categoryId,
    },

    select: categoryAdminSelect,
  });
}

export async function createAdminCategory(input) {
  let displayOrder = input.displayOrder;

  if (displayOrder === undefined) {
    const highestCategory = await prisma.category.findFirst({
      orderBy: {
        displayOrder: "desc",
      },

      select: {
        displayOrder: true,
      },
    });

    displayOrder = (highestCategory?.displayOrder ?? -1) + 1;
  }

  const category = await prisma.category.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
      displayOrder,
    },

    select: categoryAdminSelect,
  });

  return serializeAdminCategory(category);
}

export async function updateAdminCategory(categoryId, input) {
  const result = await prisma.category.updateMany({
    where: {
      id: categoryId,
    },

    data: input,
  });

  if (result.count !== 1) {
    return null;
  }

  const category = await findCategoryById(categoryId);

  return category ? serializeAdminCategory(category) : null;
}

export async function updateAdminCategoryStatus(
  categoryId,
  { isActive, confirmHideProducts },
) {
  return prisma.$transaction(async (transaction) => {
    const category = await transaction.category.findUnique({
      where: {
        id: categoryId,
      },

      select: {
        ...categoryAdminSelect,

        products: {
          where: {
            status: "ACTIVE",
            archivedAt: null,
          },

          select: {
            id: true,
          },

          take: 1,
        },
      },
    });

    if (!category) {
      return {
        status: "NOT_FOUND",
      };
    }

    const hasActiveProducts = category.products.length > 0;

    if (isActive === false && hasActiveProducts && !confirmHideProducts) {
      return {
        status: "CONFIRMATION_REQUIRED",

        category: serializeAdminCategory(category),
      };
    }

    const updatedCategory = await transaction.category.update({
      where: {
        id: categoryId,
      },

      data: {
        isActive,
      },

      select: categoryAdminSelect,
    });

    return {
      status: "UPDATED",

      category: serializeAdminCategory(updatedCategory),
    };
  });
}

export async function reorderAdminCategories(categoryIds) {
  return prisma.$transaction(async (transaction) => {
    const existingCategories = await transaction.category.findMany({
      select: {
        id: true,
      },
    });

    if (existingCategories.length !== categoryIds.length) {
      return {
        status: "INCOMPLETE_CATEGORY_LIST",
      };
    }

    const existingCategoryIdSet = new Set(
      existingCategories.map((category) => category.id),
    );

    const containsUnknownCategory = categoryIds.some(
      (categoryId) => !existingCategoryIdSet.has(categoryId),
    );

    if (containsUnknownCategory) {
      return {
        status: "UNKNOWN_CATEGORY",
      };
    }

    for (let index = 0; index < categoryIds.length; index += 1) {
      await transaction.category.update({
        where: {
          id: categoryIds[index],
        },

        data: {
          displayOrder: index,
        },
      });
    }

    const reorderedCategories = await transaction.category.findMany({
      orderBy: [
        {
          displayOrder: "asc",
        },
        {
          name: "asc",
        },
      ],

      select: categoryAdminSelect,
    });

    return {
      status: "UPDATED",

      categories: reorderedCategories.map(serializeAdminCategory),
    };
  });
}
