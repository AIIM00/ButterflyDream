import { randomUUID } from "node:crypto";

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const UPLOAD_URL_EXPIRATION_SECONDS = 5 * 60;

export async function createSiteMediaUploadUrl(input) {
  const { bucketName, createPublicR2Url, r2Client, siteMediaPrefix } =
    await import("../config/r2.js");

  const objectKey = [
    siteMediaPrefix,

    `${randomUUID()}.${input.extension}`,
  ].join("/");

  const uploadCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,

    ContentType: input.contentType,

    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(r2Client, uploadCommand, {
    expiresIn: UPLOAD_URL_EXPIRATION_SECONDS,
  });

  const expiresAt = new Date(Date.now() + UPLOAD_URL_EXPIRATION_SECONDS * 1000);

  return {
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
  };
}
