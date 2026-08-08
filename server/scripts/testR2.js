import "dotenv/config";

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { bucketName, createPublicR2Url, r2Client } from "../config/r2.js";

const transparentPixel = Buffer.from(
  [
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
    "CAQAAAC1HAwCAAAAC0lEQVR42mNk+A8A",
    "AQUBAScY42YAAAAASUVORK5CYII=",
  ].join(""),
  "base64",
);

async function testR2() {
  const objectKey = `system-tests/r2-test-${Date.now()}.png`;

  let objectWasUploaded = false;

  try {
    console.log("Uploading temporary image to Cloudflare R2...");

    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: transparentPixel,
        ContentType: "image/png",
        CacheControl: "public, max-age=31536000, immutable",

        Metadata: {
          purpose: "connection-test",
        },
      }),
    );

    objectWasUploaded = true;

    console.log("Temporary image uploaded successfully.");

    await r2Client.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );

    console.log("Cloudflare R2 confirmed the image exists.");

    console.log(`Temporary public URL: ${createPublicR2Url(objectKey)}`);

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );

    objectWasUploaded = false;

    console.log("Temporary image deleted successfully.");

    console.log("Cloudflare R2 is ready for product uploads.");
  } catch (error) {
    console.error(
      "Cloudflare R2 test failed:",
      error instanceof Error ? error.message : error,
    );

    process.exitCode = 1;
  } finally {
    if (objectWasUploaded) {
      await r2Client
        .send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
          }),
        )
        .catch(() => {
          console.error(
            "The temporary R2 image could not be cleaned up automatically.",
          );
        });
    }

    r2Client.destroy();
  }
}

await testR2();
