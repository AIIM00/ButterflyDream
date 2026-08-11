const FILE_NAME_MAX_LENGTH = 255;
const MAX_CATEGORY_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

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

export class AdminCategoryImageUploadValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "AdminCategoryImageUploadValidationError";
    this.statusCode = 400;
  }
}

function validatePlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AdminCategoryImageUploadValidationError(
      "A valid request body is required.",
    );
  }
}

function parseFileName(value) {
  if (typeof value !== "string") {
    throw new AdminCategoryImageUploadValidationError(
      "Image filename is required.",
    );
  }

  const fileName = value.trim();

  if (fileName.length < 1 || fileName.length > FILE_NAME_MAX_LENGTH) {
    throw new AdminCategoryImageUploadValidationError(
      `Image filename must contain between 1 and ${FILE_NAME_MAX_LENGTH} characters.`,
    );
  }

  if (
    fileName.includes("/") ||
    fileName.includes("\\") ||
    fileName.includes("\0")
  ) {
    throw new AdminCategoryImageUploadValidationError(
      "Image filename contains invalid characters.",
    );
  }

  return fileName;
}

function parseContentType(value) {
  if (typeof value !== "string") {
    throw new AdminCategoryImageUploadValidationError(
      "Image content type is required.",
    );
  }

  const contentType = value.trim().toLowerCase();

  const configuration = imageTypeConfiguration[contentType];

  if (!configuration) {
    throw new AdminCategoryImageUploadValidationError(
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
    value > MAX_CATEGORY_IMAGE_SIZE_BYTES
  ) {
    throw new AdminCategoryImageUploadValidationError(
      "Category images must be no larger than 10 MB.",
    );
  }

  return value;
}

export function parseCategoryImageUploadRequest(body) {
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

export function parseCategoryImageFinalizeRequest(body) {
  validatePlainObject(body);

  if (typeof body.objectKey !== "string" || !body.objectKey.trim()) {
    throw new AdminCategoryImageUploadValidationError(
      "R2 object key is required.",
    );
  }

  return {
    objectKey: body.objectKey.trim(),
  };
}

export { MAX_CATEGORY_IMAGE_SIZE_BYTES };
