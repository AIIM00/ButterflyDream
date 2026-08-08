const FILE_NAME_MAX_LENGTH = 255;

const MAX_PRODUCT_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const imageTypeConfiguration = Object.freeze({
  "image/jpeg": {
    extension: "jpg",
  },

  "image/png": {
    extension: "png",
  },

  "image/webp": {
    extension: "webp",
  },
});

export class AdminProductImageUploadValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "AdminProductImageUploadValidationError";

    this.statusCode = 400;
  }
}

function validatePlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AdminProductImageUploadValidationError(
      "A valid request body is required.",
    );
  }
}

function parseFileName(value) {
  if (typeof value !== "string") {
    throw new AdminProductImageUploadValidationError(
      "Image filename is required.",
    );
  }

  const fileName = value.trim();

  if (fileName.length < 1 || fileName.length > FILE_NAME_MAX_LENGTH) {
    throw new AdminProductImageUploadValidationError(
      `Image filename must contain between 1 and ${FILE_NAME_MAX_LENGTH} characters.`,
    );
  }

  if (
    fileName.includes("/") ||
    fileName.includes("\\") ||
    fileName.includes("\0")
  ) {
    throw new AdminProductImageUploadValidationError(
      "Image filename contains invalid characters.",
    );
  }

  return fileName;
}

function parseContentType(value) {
  if (typeof value !== "string") {
    throw new AdminProductImageUploadValidationError(
      "Image content type is required.",
    );
  }

  const contentType = value.trim().toLowerCase();

  const configuration = imageTypeConfiguration[contentType];

  if (!configuration) {
    throw new AdminProductImageUploadValidationError(
      "Only JPG, PNG, and WebP images are allowed.",
    );
  }

  return {
    contentType,
    extension: configuration.extension,
  };
}

function parseFileSize(value) {
  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > MAX_PRODUCT_IMAGE_SIZE_BYTES
  ) {
    throw new AdminProductImageUploadValidationError(
      "Product images must be no larger than 10 MB.",
    );
  }

  return value;
}

export function parseProductImageUploadRequest(body) {
  validatePlainObject(body);

  const fileName = parseFileName(body.fileName);

  const { contentType, extension } = parseContentType(body.contentType);

  const fileSize = parseFileSize(body.fileSize);

  return {
    fileName,
    fileSize,
    contentType,
    extension,
  };
}

export function parseProductImageFinalizeRequest(body) {
  validatePlainObject(body);

  if (typeof body.objectKey !== "string" || !body.objectKey.trim()) {
    throw new AdminProductImageUploadValidationError(
      "R2 object key is required.",
    );
  }

  let altText = null;

  if (body.altText !== undefined && body.altText !== null) {
    if (typeof body.altText !== "string" || body.altText.trim().length > 200) {
      throw new AdminProductImageUploadValidationError(
        "Image alt text must not exceed 200 characters.",
      );
    }

    altText = body.altText.trim() || null;
  }

  return {
    objectKey: body.objectKey.trim(),

    altText,
  };
}

export { MAX_PRODUCT_IMAGE_SIZE_BYTES };
