import { isDeepStrictEqual } from "node:util";

import prisma from "../src/prisma.js";

import {
  DEFAULT_SITE_THEME,
  normalizeSiteTheme,
} from "../config/siteThemeConfig.js";

const PUBLICATION_ID = "default";

function normalizeSection(section) {
  return {
    id: section.id,
    type: section.type,
    name: section.name,
    position: section.position,
    isEnabled: section.isEnabled,

    content: section.content ?? {},
  };
}

function normalizePublishedHomepage(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((section) => section && typeof section === "object")
    .map(normalizeSection)
    .sort(
      (firstSection, secondSection) =>
        (firstSection.position ?? 0) - (secondSection.position ?? 0),
    );
}

export async function getDraftSiteSnapshot() {
  const [sections, theme] = await Promise.all([
    prisma.homeSection.findMany({
      orderBy: [
        {
          position: "asc",
        },

        {
          createdAt: "asc",
        },
      ],
    }),

    prisma.siteTheme.findUnique({
      where: {
        id: "default",
      },
    }),
  ]);

  return {
    homepage: sections.map(normalizeSection),

    theme: theme ? normalizeSiteTheme(theme) : DEFAULT_SITE_THEME,
  };
}

export async function getPublishedSiteSnapshot() {
  const publication = await prisma.sitePublication.findUnique({
    where: {
      id: PUBLICATION_ID,
    },
  });

  if (!publication) {
    return null;
  }

  return {
    sections: normalizePublishedHomepage(publication.homepage),

    theme: normalizeSiteTheme(publication.theme),

    publishedAt: publication.publishedAt,

    publishedByUserId: publication.publishedByUserId,
  };
}

export async function getSitePublicationStatus() {
  const [draft, publication] = await Promise.all([
    getDraftSiteSnapshot(),

    prisma.sitePublication.findUnique({
      where: {
        id: PUBLICATION_ID,
      },

      select: {
        homepage: true,
        theme: true,
        publishedAt: true,
        publishedByUserId: true,
      },
    }),
  ]);

  if (!publication) {
    return {
      isPublished: false,

      hasUnpublishedChanges: true,

      homepageChanged: true,

      themeChanged: true,

      publishedAt: null,

      publishedByUserId: null,
    };
  }

  const publishedHomepage = normalizePublishedHomepage(publication.homepage);

  const publishedTheme = normalizeSiteTheme(publication.theme);

  const homepageChanged = !isDeepStrictEqual(draft.homepage, publishedHomepage);

  const themeChanged = !isDeepStrictEqual(draft.theme, publishedTheme);

  return {
    isPublished: true,

    hasUnpublishedChanges: homepageChanged || themeChanged,

    homepageChanged,

    themeChanged,

    publishedAt: publication.publishedAt,

    publishedByUserId: publication.publishedByUserId,
  };
}

export async function publishSite({ adminUserId = null } = {}) {
  const draft = await getDraftSiteSnapshot();

  const publication = await prisma.sitePublication.upsert({
    where: {
      id: PUBLICATION_ID,
    },

    create: {
      id: PUBLICATION_ID,

      homepage: draft.homepage,

      theme: draft.theme,

      publishedAt: new Date(),

      publishedByUserId: adminUserId,
    },

    update: {
      homepage: draft.homepage,

      theme: draft.theme,

      publishedAt: new Date(),

      publishedByUserId: adminUserId,
    },
  });

  return {
    publishedAt: publication.publishedAt,

    publishedByUserId: publication.publishedByUserId,

    hasUnpublishedChanges: false,

    homepageChanged: false,

    themeChanged: false,
  };
}
