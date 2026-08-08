import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

import prisma from "../src/prisma.js";

const MAX_PRODUCT_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

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

export async function finalizeProductImageUpload(productId, input) {
  const { bucketName, createPublicR2Url, productPrefix, r2Client } =
    await import("../config/r2.js");

  const objectKey = normalizeObjectKey(input.objectKey);

  const requiredPrefix = `${productPrefix}/${productId}/`;

  /*
   * Critical security check:
   *
   * An admin can only finalize an object that
   * belongs to this specific product folder.
   */
  if (!objectKey || !objectKey.startsWith(requiredPrefix)) {
    return {
      status: "INVALID_OBJECT_KEY",
    };
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },

    select: {
      id: true,
      archivedAt: true,
    },
  });

  if (!product) {
    return {
      status: "PRODUCT_NOT_FOUND",
    };
  }

  if (product.archivedAt) {
    return {
      status: "PRODUCT_ARCHIVED",
    };
  }

  /*
   * Do not trust the browser claiming that an
   * upload succeeded. Verify the real R2 object.
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
   * Check the real object metadata instead
   * of trusting the values sent before upload.
   */
  if (
    !ALLOWED_CONTENT_TYPES.has(contentType) ||
    !Number.isInteger(fileSize) ||
    fileSize < 1 ||
    fileSize > MAX_PRODUCT_IMAGE_SIZE_BYTES
  ) {
    /*
     * Invalid objects should not remain in R2.
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

  /*
   * Prevent the same R2 object from being
   * registered more than once.
   */
  const existingImage = await prisma.productImage.findUnique({
    where: {
      storageKey: objectKey,
    },
  });

  if (existingImage) {
    return {
      status: "ALREADY_REGISTERED",
      image: existingImage,
    };
  }

  const currentImageCount = await prisma.productImage.count({
    where: {
      productId,
    },
  });

  if (currentImageCount >= 8) {
    /*
     * The upload exists but cannot be registered,
     * so clean it from R2.
     */
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );

    return {
      status: "IMAGE_LIMIT_REACHED",
    };
  }

  const isPrimary = currentImageCount === 0;

  const imageUrl = createPublicR2Url(objectKey);

  const image = await prisma.productImage.create({
    data: {
      productId,
      imageUrl,
      storageKey: objectKey,
      contentType,
      fileSize,

      altText:
        typeof input.altText === "string" && input.altText.trim()
          ? input.altText.trim()
          : null,

      isPrimary,

      position: currentImageCount,
    },
  });

  return {
    status: "CREATED",
    image,
  };
}
