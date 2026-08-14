import prisma from "../src/prisma.js";

import {
  DEFAULT_SITE_THEME,
  normalizeSiteTheme,
} from "../config/siteThemeConfig.js";

const sectionSelect = {
  id: true,
  type: true,
  name: true,
  position: true,
  isEnabled: true,
  content: true,
  createdAt: true,
  updatedAt: true,
};

export async function listAdminHomeSections() {
  return prisma.homeSection.findMany({
    orderBy: [
      {
        position: "asc",
      },
      {
        createdAt: "asc",
      },
    ],

    select: sectionSelect,
  });
}

export async function createAdminHomeSection(input) {
  return prisma.$transaction(async (transaction) => {
    const positionResult = await transaction.homeSection.aggregate({
      _max: {
        position: true,
      },
    });

    const nextPosition =
      positionResult._max.position === null
        ? 0
        : positionResult._max.position + 1;

    return transaction.homeSection.create({
      data: {
        type: input.type,
        name: input.name,
        content: input.content,
        position: nextPosition,
        isEnabled: input.isEnabled ?? true,
      },

      select: sectionSelect,
    });
  });
}

export async function updateAdminHomeSection(sectionId, input) {
  const existingSection = await prisma.homeSection.findUnique({
    where: {
      id: sectionId,
    },

    select: {
      id: true,
    },
  });

  if (!existingSection) {
    return null;
  }

  return prisma.homeSection.update({
    where: {
      id: sectionId,
    },

    data: input,

    select: sectionSelect,
  });
}

export async function deleteAdminHomeSection(sectionId) {
  return prisma.$transaction(async (transaction) => {
    const existingSection = await transaction.homeSection.findUnique({
      where: {
        id: sectionId,
      },

      select: {
        id: true,
      },
    });

    if (!existingSection) {
      return null;
    }

    await transaction.homeSection.delete({
      where: {
        id: sectionId,
      },
    });

    const remainingSections = await transaction.homeSection.findMany({
      orderBy: [
        {
          position: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      select: {
        id: true,
        position: true,
      },
    });

    await Promise.all(
      remainingSections.map((section, index) => {
        if (section.position === index) {
          return Promise.resolve();
        }

        return transaction.homeSection.update({
          where: {
            id: section.id,
          },

          data: {
            position: index,
          },
        });
      }),
    );

    return {
      id: sectionId,
    };
  });
}

export async function reorderAdminHomeSections(sectionIds) {
  return prisma.$transaction(async (transaction) => {
    const existingSections = await transaction.homeSection.findMany({
      select: {
        id: true,
      },
    });

    if (existingSections.length !== sectionIds.length) {
      return {
        status: "INCOMPLETE_SECTION_LIST",
      };
    }

    const existingIds = new Set(existingSections.map((section) => section.id));

    const containsUnknownSection = sectionIds.some(
      (sectionId) => !existingIds.has(sectionId),
    );

    if (containsUnknownSection) {
      return {
        status: "UNKNOWN_SECTION",
      };
    }

    await Promise.all(
      sectionIds.map((sectionId, position) =>
        transaction.homeSection.update({
          where: {
            id: sectionId,
          },

          data: {
            position,
          },
        }),
      ),
    );

    const sections = await transaction.homeSection.findMany({
      orderBy: [
        {
          position: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      select: sectionSelect,
    });

    return {
      status: "SUCCESS",
      sections,
    };
  });
}

const siteThemeSelect = {
  id: true,
  colors: true,
  fonts: true,
  createdAt: true,
  updatedAt: true,
};

async function getOrCreateSiteTheme(database) {
  const existingTheme = await database.siteTheme.findUnique({
    where: {
      id: "default",
    },

    select: siteThemeSelect,
  });

  if (existingTheme) {
    return existingTheme;
  }

  return database.siteTheme.create({
    data: {
      id: "default",

      colors: DEFAULT_SITE_THEME.colors,

      fonts: DEFAULT_SITE_THEME.fonts,
    },

    select: siteThemeSelect,
  });
}

export async function getAdminSiteTheme() {
  const theme = await getOrCreateSiteTheme(prisma);

  const normalizedTheme = normalizeSiteTheme(theme);

  return {
    ...theme,

    colors: normalizedTheme.colors,

    fonts: normalizedTheme.fonts,
  };
}

export async function updateAdminSiteTheme(input) {
  return prisma.$transaction(async (transaction) => {
    const existingTheme = await getOrCreateSiteTheme(transaction);

    const currentTheme = normalizeSiteTheme(existingTheme);

    const nextColors = {
      ...currentTheme.colors,
      ...(input.colors ?? {}),
    };

    const nextFonts = {
      ...currentTheme.fonts,
      ...(input.fonts ?? {}),
    };

    const updatedTheme = await transaction.siteTheme.update({
      where: {
        id: "default",
      },

      data: {
        colors: nextColors,
        fonts: nextFonts,
      },

      select: siteThemeSelect,
    });

    return {
      ...updatedTheme,
      ...normalizeSiteTheme(updatedTheme),
    };
  });
}
