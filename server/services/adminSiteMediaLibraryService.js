import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import prisma from "../src/prisma.js";

function sectionContentReferencesAsset(value, assetId, parentKey = "") {
  if (Array.isArray(value)) {
    return value.some((item) =>
      sectionContentReferencesAsset(item, assetId, parentKey),
    );
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.entries(value).some(([key, nestedValue]) => {
    /*
     * Supports names such as:
     *
     * assetId
     * imageAssetId
     * backgroundAssetId
     * mediaAssetId
     */
    const normalizedKey = key.toLowerCase();

    if (normalizedKey.endsWith("assetid") && nestedValue === assetId) {
      return true;
    }

    return sectionContentReferencesAsset(
      nestedValue,
      assetId,
      key || parentKey,
    );
  });
}

export async function listAdminSiteMediaAssets({ page, limit, search }) {
  const where = search
    ? {
        OR: [
          {
            fileName: {
              contains: search,
              mode: "insensitive",
            },
          },

          {
            altText: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  const skip = (page - 1) * limit;

  const [assets, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.mediaAsset.count({
      where,
    }),
  ]);

  return {
    assets,

    pagination: {
      page,
      limit,
      total,

      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function updateAdminSiteMediaAsset(assetId, input) {
  const existingAsset = await prisma.mediaAsset.findUnique({
    where: {
      id: assetId,
    },

    select: {
      id: true,
    },
  });

  if (!existingAsset) {
    return null;
  }

  return prisma.mediaAsset.update({
    where: {
      id: assetId,
    },

    data: input,
  });
}

async function findMediaAssetReferences(assetId) {
  const [sections, publication, popupImages] = await Promise.all([
    prisma.homeSection.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        content: true,
      },
    }),

    prisma.sitePublication.findUnique({
      where: {
        id: "default",
      },

      select: {
        homepage: true,
      },
    }),

    prisma.popupEventImage.findMany({
      where: {
        mediaAssetId: assetId,
      },

      select: {
        popupEvent: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    }),
  ]);
  /*
   * Draft references
   *
   * HomeSection is now our editable/draft CMS state.
   */
  const draftReferences = sections
    .filter((section) =>
      sectionContentReferencesAsset(section.content, assetId),
    )
    .map((section) => ({
      id: section.id,
      name: section.name,
      type: section.type,
      source: "DRAFT",
    }));

  /*
   * Published reference
   *
   * SitePublication.homepage contains the last
   * published homepage snapshot.
   *
   * We must protect images used there even if
   * the admin already removed them from the draft.
   */
  const publishedHomepage = Array.isArray(publication?.homepage)
    ? publication.homepage
    : [];

  const publishedReferences = publishedHomepage
    .filter((section) =>
      sectionContentReferencesAsset(section?.content, assetId),
    )
    .map((section, index) => ({
      id: section?.id ?? `published-section-${index}`,

      name: section?.name ?? "Published homepage section",

      type: section?.type ?? "UNKNOWN",

      source: "PUBLISHED",
    }));
  const popupReferences = popupImages.map((image) => ({
    id: image.popupEvent.id,

    name: image.popupEvent.title,

    type: "POPUP_EVENT",

    source: image.popupEvent.status,
  }));
  return [...draftReferences, ...publishedReferences, ...popupReferences];
}

export async function deleteAdminSiteMediaAsset(assetId) {
  const asset = await prisma.mediaAsset.findUnique({
    where: {
      id: assetId,
    },
  });

  if (!asset) {
    return {
      status: "NOT_FOUND",
    };
  }

  const references = await findMediaAssetReferences(assetId);

  if (references.length > 0) {
    return {
      status: "IN_USE",
      asset,
      references,
    };
  }

  /*
   * Remove the database record first.
   *
   * If Cloudflare deletion later fails, we only
   * leave an orphaned object in storage rather
   * than leaving a website record pointing to a
   * missing image.
   */
  await prisma.mediaAsset.delete({
    where: {
      id: assetId,
    },
  });

  try {
    const { bucketName, r2Client } = await import("../config/r2.js");

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: asset.storageKey,
      }),
    );
  } catch (error) {
    console.error(
      "Media asset database record was deleted, but the R2 object could not be removed:",
      {
        assetId,
        storageKey: asset.storageKey,
        error,
      },
    );

    return {
      status: "DELETED_WITH_STORAGE_WARNING",

      asset,
    };
  }

  return {
    status: "DELETED",
    asset,
  };
}
