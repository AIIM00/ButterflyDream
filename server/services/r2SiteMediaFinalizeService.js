import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

import prisma from "../src/prisma.js";

const MAX_SITE_MEDIA_SIZE_BYTES = 10 * 1024 * 1024;

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

export async function finalizeSiteMediaUpload(input) {
  const { bucketName, createPublicR2Url, r2Client, siteMediaPrefix } =
    await import("../config/r2.js");

  const objectKey = normalizeObjectKey(input.objectKey);

  const requiredPrefix = `${siteMediaPrefix}/`;

  /*
   * Never allow this endpoint to register
   * product/category objects as website media.
   */
  if (!objectKey || !objectKey.startsWith(requiredPrefix)) {
    return {
      status: "INVALID_OBJECT_KEY",
    };
  }

  /*
   * Make finalization idempotent.
   */
  const existingAsset = await prisma.mediaAsset.findUnique({
    where: {
      storageKey: objectKey,
    },
  });

  if (existingAsset) {
    return {
      status: "ALREADY_REGISTERED",
      asset: existingAsset,
    };
  }

  /*
   * Verify the real object in Cloudflare R2.
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

  if (
    !ALLOWED_CONTENT_TYPES.has(contentType) ||
    !Number.isInteger(fileSize) ||
    fileSize < 1 ||
    fileSize > MAX_SITE_MEDIA_SIZE_BYTES
  ) {
    /*
     * Invalid files must not remain
     * inside the website media folder.
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

  let asset;

  try {
    asset = await prisma.mediaAsset.create({
      data: {
        fileName: input.fileName,

        imageUrl,

        storageKey: objectKey,

        contentType,

        fileSize,

        altText: input.altText,

        width: input.width,

        height: input.height,
      },
    });
  } catch (error) {
    /*
     * If PostgreSQL rejects registration,
     * don't leave an orphaned R2 object.
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
        "Unable to remove unregistered website image from R2:",
        cleanupError,
      );
    }

    throw error;
  }

  return {
    status: "CREATED",
    asset,
  };
}
