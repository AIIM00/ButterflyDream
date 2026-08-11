import { randomUUID } from "node:crypto";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import prisma from "../src/prisma.js";

const UPLOAD_URL_EXPIRATION_SECONDS = 5 * 60;

export async function createCategoryImageUploadUrl(categoryId, input) {
  if (typeof categoryId !== "string" || !categoryId.trim()) {
    throw new TypeError("A valid category ID is required.");
  }

  const normalizedCategoryId = categoryId.trim();

  /*
   * The category must exist before we allow
   * an image to be uploaded for it.
   */
  const category = await prisma.category.findUnique({
    where: {
      id: normalizedCategoryId,
    },

    select: {
      id: true,
    },
  });

  if (!category) {
    return {
      status: "CATEGORY_NOT_FOUND",
    };
  }

  const { bucketName, categoryPrefix, createPublicR2Url, r2Client } =
    await import("../config/r2.js");

  /*
   * Store every category inside its own folder:
   *
   * categories/<category-id>/<uuid>.webp
   */
  const objectKey = [
    categoryPrefix,
    normalizedCategoryId,
    `${randomUUID()}.${input.extension}`,
  ].join("/");

  const uploadCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: input.contentType,

    CacheControl: "public, max-age=31536000, immutable",

    Metadata: {
      categoryId: normalizedCategoryId,
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
