const FILE_NAME_MAX_LENGTH = 255;
const ALT_TEXT_MAX_LENGTH = 300;

const MAX_SITE_MEDIA_SIZE_BYTES = 10 * 1024 * 1024;

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
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_MEDIA_PAGE_SIZE = 100;

export class AdminSiteMediaValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "AdminSiteMediaValidationError";
    this.statusCode = 400;
  }
}

function validatePlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AdminSiteMediaValidationError(
      "A valid request body is required.",
    );
  }
}

function parseFileName(value) {
  if (typeof value !== "string") {
    throw new AdminSiteMediaValidationError("Image filename is required.");
  }

  const fileName = value.trim();

  if (fileName.length < 1 || fileName.length > FILE_NAME_MAX_LENGTH) {
    throw new AdminSiteMediaValidationError(
      `Image filename must contain between 1 and ${FILE_NAME_MAX_LENGTH} characters.`,
    );
  }

  if (
    fileName.includes("/") ||
    fileName.includes("\\") ||
    fileName.includes("\0")
  ) {
    throw new AdminSiteMediaValidationError(
      "Image filename contains invalid characters.",
    );
  }

  return fileName;
}

function parseContentType(value) {
  if (typeof value !== "string") {
    throw new AdminSiteMediaValidationError("Image content type is required.");
  }

  const contentType = value.trim().toLowerCase();

  const configuration = imageTypeConfiguration[contentType];

  if (!configuration) {
    throw new AdminSiteMediaValidationError(
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
    value > MAX_SITE_MEDIA_SIZE_BYTES
  ) {
    throw new AdminSiteMediaValidationError(
      "Website images must be no larger than 10 MB.",
    );
  }

  return value;
}

function parseAltText(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new AdminSiteMediaValidationError("Image alt text must be a string.");
  }

  const altText = value.trim();

  if (altText.length > ALT_TEXT_MAX_LENGTH) {
    throw new AdminSiteMediaValidationError(
      `Image alt text must not exceed ${ALT_TEXT_MAX_LENGTH} characters.`,
    );
  }

  return altText || null;
}

function parseDimension(value, fieldName) {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value < 1 || value > 20000) {
    throw new AdminSiteMediaValidationError(
      `${fieldName} must be a positive integer no greater than 20000.`,
    );
  }

  return value;
}

export function parseSiteMediaUploadRequest(body) {
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

export function parseSiteMediaFinalizeRequest(body) {
  validatePlainObject(body);

  if (typeof body.objectKey !== "string" || !body.objectKey.trim()) {
    throw new AdminSiteMediaValidationError("R2 object key is required.");
  }

  return {
    objectKey: body.objectKey.trim(),

    fileName: parseFileName(body.fileName),

    altText: parseAltText(body.altText),

    width: parseDimension(body.width, "Image width"),

    height: parseDimension(body.height, "Image height"),
  };
}

export { MAX_SITE_MEDIA_SIZE_BYTES };

export function parseSiteMediaAssetId(value) {
  if (typeof value !== "string" || !UUID_PATTERN.test(value.trim())) {
    throw new AdminSiteMediaValidationError("Invalid media asset ID.");
  }

  return value.trim();
}

export function parseSiteMediaListQuery(query = {}) {
  const rawPage = Number.parseInt(query.page ?? "1", 10);
  const rawLimit = Number.parseInt(query.limit ?? "30", 10);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const limit =
    Number.isInteger(rawLimit) &&
    rawLimit > 0 &&
    rawLimit <= MAX_MEDIA_PAGE_SIZE
      ? rawLimit
      : 30;

  const search =
    typeof query.search === "string" ? query.search.trim().slice(0, 100) : "";

  return {
    page,
    limit,
    search,
  };
}

export function parseSiteMediaUpdateRequest(body) {
  validatePlainObject(body);

  const input = {};

  if (Object.prototype.hasOwnProperty.call(body, "fileName")) {
    input.fileName = parseFileName(body.fileName);
  }

  if (Object.prototype.hasOwnProperty.call(body, "altText")) {
    input.altText = parseAltText(body.altText);
  }

  const unknownKeys = Object.keys(body).filter(
    (key) => key !== "fileName" && key !== "altText",
  );

  if (unknownKeys.length > 0) {
    throw new AdminSiteMediaValidationError(
      `Unknown media setting: ${unknownKeys[0]}.`,
    );
  }

  if (Object.keys(input).length === 0) {
    throw new AdminSiteMediaValidationError(
      "Provide at least one media field to update.",
    );
  }

  return input;
}
