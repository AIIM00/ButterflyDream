import { S3Client } from "@aws-sdk/client-s3";

const requiredVariables = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_BASE_URL",
];

const missingVariables = requiredVariables.filter(
  (variableName) => !process.env[variableName]?.trim(),
);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required Cloudflare R2 environment variables: ${missingVariables.join(
      ", ",
    )}`,
  );
}

const accountId = process.env.R2_ACCOUNT_ID.trim();

const bucketName = process.env.R2_BUCKET_NAME.trim();

const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL.trim().replace(/\/+$/, "");

const productPrefix = (process.env.R2_PRODUCT_PREFIX?.trim() || "products")
  .replace(/^\/+/, "")
  .replace(/\/+$/, "");

const categoryPrefix = (process.env.R2_CATEGORY_PREFIX?.trim() || "categories")
  .replace(/^\/+/, "")
  .replace(/\/+$/, "");

const siteMediaPrefix = (
  process.env.R2_SITE_MEDIA_PREFIX?.trim() || "site/media"
)
  .replace(/^\/+/, "")
  .replace(/\/+$/, "");

const r2Client = new S3Client({
  region: "auto",

  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,

  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),

    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
  },
});

function createPublicR2Url(objectKey) {
  const normalizedObjectKey = objectKey.replace(/^\/+/, "");

  return `${publicBaseUrl}/${normalizedObjectKey}`;
}

export {
  bucketName,
  categoryPrefix,
  createPublicR2Url,
  productPrefix,
  publicBaseUrl,
  r2Client,
  siteMediaPrefix,
};
