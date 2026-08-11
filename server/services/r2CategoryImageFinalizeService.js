import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

import prisma from "../src/prisma.js";

const MAX_CATEGORY_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function normalizeObjectKey(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/^\/+/, "");
}

export async function finalizeCategoryImageUpload(categoryId, input) {
  const { bucketName, categoryPrefix, createPublicR2Url, r2Client } =
    await import("../config/r2.js");

  const objectKey = normalizeObjectKey(input.objectKey);

  const requiredPrefix = `${categoryPrefix}/${categoryId}/`;

  /*
   * Critical security check:
   *
   * The administrator may only finalize an
   * R2 object belonging to this category.
   */
  if (!objectKey || !objectKey.startsWith(requiredPrefix)) {
    return {
      status: "INVALID_OBJECT_KEY",
    };
  }

  /*
   * Get the current category image metadata too,
   * because we may need to remove the old R2
   * object after the new image is saved.
   */
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },

    select: {
      id: true,
      name: true,
      slug: true,

      imageUrl: true,
      imageStorageKey: true,
      imageContentType: true,
      imageFileSize: true,
    },
  });

  if (!category) {
    return {
      status: "CATEGORY_NOT_FOUND",
    };
  }

  /*
   * Make finalization idempotent.
   *
   * If the same request is submitted again after
   * the category was already updated, return the
   * existing result rather than processing it twice.
   */
  if (category.imageStorageKey === objectKey) {
    return {
      status: "ALREADY_REGISTERED",

      category,
    };
  }

  /*
   * Do not trust values reported by the frontend.
   * Verify the actual object stored in R2.
   */
  let objectMetadata;

  try {
    objectMetadata = await r2Client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );
  } catch (error) {
    if (
      error?.$metadata?.httpStatusCode === 404 ||
      error?.name === "NotFound"
    ) {
      return {
        status: "OBJECT_NOT_FOUND",
      };
    }

    throw error;
  }

  const contentType = objectMetadata.ContentType?.trim().toLowerCase();

  const fileSize = Number(objectMetadata.ContentLength ?? 0);

  /*
   * Validate the actual uploaded R2 object,
   * not only the values sent before upload.
   */
  if (
    !ALLOWED_CONTENT_TYPES.has(contentType) ||
    !Number.isInteger(fileSize) ||
    fileSize < 1 ||
    fileSize > MAX_CATEGORY_IMAGE_SIZE_BYTES
  ) {
    /*
     * Invalid uploaded objects should not remain
     * inside the R2 bucket.
     */
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );

    return {
      status: "INVALID_OBJECT",
    };
  }

  const imageUrl = createPublicR2Url(objectKey);

  const oldStorageKey = category.imageStorageKey;

  let updatedCategory;

  try {
    /*
     * Save the verified new image first.
     *
     * We intentionally do NOT delete the old
     * category image before this succeeds.
     */
    updatedCategory = await prisma.category.update({
      where: {
        id: categoryId,
      },

      data: {
        imageUrl,
        imageStorageKey: objectKey,
        imageContentType: contentType,
        imageFileSize: fileSize,
      },

      select: {
        id: true,
        name: true,
        slug: true,
        description: true,

        imageUrl: true,
        imageStorageKey: true,
        imageContentType: true,
        imageFileSize: true,

        isActive: true,
        displayOrder: true,
        createdAt: true,
        updatedAt: true,

        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  } catch (error) {
    /*
     * PostgreSQL did not accept the new image.
     *
     * The new object is therefore unused, so
     * make a best-effort attempt to remove it.
     */
    try {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
        }),
      );
    } catch (cleanupError) {
      console.error(
        "Unable to remove unregistered category image from R2:",
        cleanupError,
      );
    }

    throw error;
  }

  /*
   * PostgreSQL now points to the new image.
   *
   * Only now is it safe to remove the previous
   * R2 category image.
   */
  if (oldStorageKey && oldStorageKey !== objectKey) {
    try {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: oldStorageKey,
        }),
      );
    } catch (cleanupError) {
      /*
       * Do not fail the request here.
       *
       * The database already correctly points to
       * the new image. A failed cleanup merely
       * leaves an unused old object in storage.
       */
      console.error(
        "Unable to remove previous category image from R2:",
        cleanupError,
      );
    }
  }

  return {
    status: "UPDATED",

    category: {
      id: updatedCategory.id,
      name: updatedCategory.name,
      slug: updatedCategory.slug,
      description: updatedCategory.description,

      imageUrl: updatedCategory.imageUrl,

      isActive: updatedCategory.isActive,
      displayOrder: updatedCategory.displayOrder,
      productCount: updatedCategory._count.products,

      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
    },
  };
}
