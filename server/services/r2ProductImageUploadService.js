import { randomUUID } from "node:crypto";

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import prisma from "../src/prisma.js";

const MAX_IMAGES_PER_PRODUCT = 8;
const UPLOAD_URL_EXPIRATION_SECONDS = 5 * 60;

export async function createProductImageUploadUrl(productId, input) {
  if (typeof productId !== "string" || !productId.trim()) {
    throw new TypeError("A valid product ID is required.");
  }

  const normalizedProductId = productId.trim();

  /*
   * Keep this query simple. The previous nested
   * _count selection caused Prisma to recurse while
   * serializing the query.
   */
  const product = await prisma.product.findUnique({
    where: {
      id: normalizedProductId,
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

  const currentImageCount = await prisma.productImage.count({
    where: {
      productId: normalizedProductId,
    },
  });

  if (currentImageCount >= MAX_IMAGES_PER_PRODUCT) {
    return {
      status: "IMAGE_LIMIT_REACHED",
    };
  }

  const { bucketName, createPublicR2Url, productPrefix, r2Client } =
    await import("../config/r2.js");

  const objectKey = [
    productPrefix,
    normalizedProductId,
    `${randomUUID()}.${input.extension}`,
  ].join("/");

  const uploadCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: input.contentType,

    CacheControl: "public, max-age=31536000, immutable",

    Metadata: {
      productId: normalizedProductId,

      originalFileName: input.fileName,
    },
  });

  const uploadUrl = await getSignedUrl(r2Client, uploadCommand, {
    expiresIn: UPLOAD_URL_EXPIRATION_SECONDS,
  });

  const expiresAt = new Date(Date.now() + UPLOAD_URL_EXPIRATION_SECONDS * 1000);

  return {
    status: "CREATED",

    upload: {
      uploadUrl,
      objectKey,

      imageUrl: createPublicR2Url(objectKey),

      contentType: input.contentType,

      declaredFileSize: input.fileSize,

      originalFileName: input.fileName,

      requiredHeaders: {
        "Content-Type": input.contentType,
      },

      expiresAt: expiresAt.toISOString(),
    },
  };
}
