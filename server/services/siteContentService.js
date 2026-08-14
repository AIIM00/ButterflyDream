import prisma from "../src/prisma.js";
import {
  DEFAULT_SITE_THEME,
  normalizeSiteTheme,
} from "../config/siteThemeConfig.js";
import { getPublicProductsByIds } from "./catalogService.js";
import { getPublishedSiteSnapshot } from "./sitePublicationService.js";

export async function getPublicHomeContent() {
  const published = await getPublishedSiteSnapshot();

  let sections;
  let theme;

  if (published) {
    sections = published.sections
      .filter((section) => section.isEnabled)
      .sort(
        (firstSection, secondSection) =>
          (firstSection.position ?? 0) - (secondSection.position ?? 0),
      );

    theme = published.theme;
  } else {
    /*
     * Bootstrap fallback.
     *
     * Until the website has been published
     * for the first time, keep using the
     * current draft CMS content.
     */
    const [draftSections, draftTheme] = await Promise.all([
      prisma.homeSection.findMany({
        where: {
          isEnabled: true,
        },

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

    sections = draftSections;

    theme = draftTheme ? normalizeSiteTheme(draftTheme) : DEFAULT_SITE_THEME;
  }

  const resolvedSections = await resolveHomepageSections(sections);

  return {
    sections: resolvedSections,

    theme,
  };
}

async function enrichHomepageMedia(sections) {
  const assetIds = new Set();

  /*
   * Collect every MediaAsset ID used by
   * supported homepage sections.
   */
  for (const section of sections) {
    if (section.type === "OPENING_SLIDER") {
      const slides = Array.isArray(section.content?.slides)
        ? section.content.slides
        : [];

      for (const slide of slides) {
        if (typeof slide?.assetId === "string") {
          assetIds.add(slide.assetId);
        }
      }
    }

    if (section.type === "TRANSFORMATION_STORY") {
      const introImages = Array.isArray(section.content?.intro?.images)
        ? section.content.intro.images
        : [];

      for (const image of introImages) {
        if (typeof image?.assetId === "string") {
          assetIds.add(image.assetId);
        }
      }

      const customizedAssetId = section.content?.customized?.imageAssetId;

      if (typeof customizedAssetId === "string") {
        assetIds.add(customizedAssetId);
      }
    }
    if (section.type === "COLLECTIONS") {
      const items = Array.isArray(section.content?.items)
        ? section.content.items
        : [];

      for (const item of items) {
        if (typeof item?.assetId === "string") {
          assetIds.add(item.assetId);
        }
      }
    }
    if (section.type === "IMAGE_TEXT" || section.type === "IMAGE_BANNER") {
      const assetId = section.content?.assetId ?? section.content?.imageAssetId;

      if (typeof assetId === "string") {
        assetIds.add(assetId);
      }
    }
  }

  if (assetIds.size === 0) {
    return sections;
  }

  const assets = await prisma.mediaAsset.findMany({
    where: {
      id: {
        in: [...assetIds],
      },
    },

    select: {
      id: true,
      imageUrl: true,
      fileName: true,
      altText: true,
      width: true,
      height: true,
    },
  });

  const assetById = new Map(assets.map((asset) => [asset.id, asset]));

  return sections.map((section) => {
    /*
     * Opening Slider
     */
    if (section.type === "OPENING_SLIDER") {
      const slides = Array.isArray(section.content?.slides)
        ? section.content.slides
        : [];

      const resolvedSlides = slides
        .map((slide) => {
          const asset = assetById.get(slide.assetId);

          if (!asset) {
            return null;
          }

          return {
            ...slide,

            imageUrl: asset.imageUrl,

            alt: slide.alt?.trim() || asset.altText || asset.fileName,

            width: asset.width,
            height: asset.height,
          };
        })
        .filter(Boolean);

      return {
        ...section,

        content: {
          ...section.content,

          slides: resolvedSlides,
        },
      };
    }

    /*
     * Transformation Story
     */
    if (section.type === "TRANSFORMATION_STORY") {
      const content = section.content ?? {};

      const intro = content.intro ?? {};

      const customized = content.customized ?? {};

      const introImages = Array.isArray(intro.images) ? intro.images : [];

      const resolvedIntroImages = introImages
        .map((image) => {
          const asset = assetById.get(image.assetId);

          if (!asset) {
            return null;
          }

          return {
            ...image,

            imageUrl: asset.imageUrl,

            alt: image.alt?.trim() || asset.altText || asset.fileName,

            width: asset.width,

            height: asset.height,
          };
        })
        .filter(Boolean);

      const customizedAsset =
        typeof customized.imageAssetId === "string"
          ? assetById.get(customized.imageAssetId)
          : null;

      return {
        ...section,

        content: {
          ...content,

          intro: {
            ...intro,

            images: resolvedIntroImages,
          },

          customized: {
            ...customized,

            imageUrl: customizedAsset?.imageUrl ?? null,

            imageAlt:
              customized.imageAlt?.trim() ||
              customizedAsset?.altText ||
              customizedAsset?.fileName ||
              "",

            imageWidth: customizedAsset?.width ?? null,

            imageHeight: customizedAsset?.height ?? null,
          },
        },
      };
    }
    if (section.type === "COLLECTIONS") {
      const content = section.content ?? {};

      const items = Array.isArray(content.items) ? content.items : [];

      const resolvedItems = items.map((item) => {
        const asset =
          typeof item.assetId === "string" ? assetById.get(item.assetId) : null;

        return {
          ...item,

          imageUrl: asset?.imageUrl ?? null,

          imageAlt:
            item.imageAlt?.trim() || asset?.altText || asset?.fileName || "",

          imageWidth: asset?.width ?? null,

          imageHeight: asset?.height ?? null,
        };
      });

      return {
        ...section,

        content: {
          ...content,

          items: resolvedItems,
        },
      };
    }
    if (section.type === "IMAGE_TEXT" || section.type === "IMAGE_BANNER") {
      const content = section.content ?? {};

      const assetId = content.assetId ?? content.imageAssetId ?? null;

      const asset = typeof assetId === "string" ? assetById.get(assetId) : null;

      return {
        ...section,

        content: {
          ...content,

          assetId,

          imageUrl: asset?.imageUrl ?? null,

          imageAlt:
            content.imageAlt?.trim() || asset?.altText || asset?.fileName || "",

          imageWidth: asset?.width ?? null,

          imageHeight: asset?.height ?? null,
        },
      };
    }

    return section;
  });
}
async function enrichFeaturedProducts(sections) {
  const featuredSection = sections.find(
    (section) => section.type === "FEATURED_PRODUCTS",
  );

  if (!featuredSection) {
    return sections;
  }

  const content = featuredSection.content ?? {};

  if (content.selectionMode !== "manual") {
    return sections;
  }

  const productIds = Array.isArray(content.productIds)
    ? content.productIds
        .filter((productId) => typeof productId === "string")
        .slice(0, 4)
    : [];

  const products = await getPublicProductsByIds(productIds);

  return sections.map((section) => {
    if (section.type !== "FEATURED_PRODUCTS") {
      return section;
    }

    return {
      ...section,

      content: {
        ...section.content,

        products,
      },
    };
  });
}

async function resolveHomepageSections(sections) {
  const mediaResolvedSections = await enrichHomepageMedia(sections);

  return enrichFeaturedProducts(mediaResolvedSections);
}
export async function getDraftHomeContent() {
  const [sections, theme] = await Promise.all([
    prisma.homeSection.findMany({
      where: {
        isEnabled: true,
      },

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

  const resolvedSections = await resolveHomepageSections(sections);

  return {
    sections: resolvedSections,

    theme: theme ? normalizeSiteTheme(theme) : DEFAULT_SITE_THEME,
  };
}
