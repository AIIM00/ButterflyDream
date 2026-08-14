const HOME_SECTION_TYPES = new Set([
  "ANNOUNCEMENT_BAR",
  "OPENING_SLIDER",
  "TRANSFORMATION_STORY",
  "CATEGORIES",
  "FEATURED_PRODUCTS",
  "COLLECTIONS",
  "FEEDBACK",
  "IMAGE_TEXT",
  "IMAGE_BANNER",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class HomeSectionValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);

    this.name = "HomeSectionValidationError";
    this.statusCode = statusCode;
  }
}

function requireObject(value, fieldName) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new HomeSectionValidationError(`${fieldName} must be an object.`);
  }

  return value;
}

function parseName(value) {
  if (typeof value !== "string") {
    throw new HomeSectionValidationError("Section name is required.");
  }

  const name = value.trim();

  if (!name) {
    throw new HomeSectionValidationError("Section name is required.");
  }

  if (name.length > 120) {
    throw new HomeSectionValidationError(
      "Section name cannot exceed 120 characters.",
    );
  }

  return name;
}

function parseType(value) {
  if (typeof value !== "string" || !HOME_SECTION_TYPES.has(value)) {
    throw new HomeSectionValidationError("Invalid homepage section type.");
  }

  return value;
}

function parseEnabled(value) {
  if (typeof value !== "boolean") {
    throw new HomeSectionValidationError("isEnabled must be true or false.");
  }

  return value;
}

function parseContent(value) {
  return requireObject(value, "content");
}

export function parseHomeSectionId(value) {
  if (typeof value !== "string" || !UUID_PATTERN.test(value.trim())) {
    throw new HomeSectionValidationError("Invalid homepage section ID.");
  }

  return value.trim();
}

export function parseCreateHomeSectionInput(body) {
  requireObject(body, "Request body");

  const input = {
    type: parseType(body.type),
    name: parseName(body.name),
    content: parseContent(body.content ?? {}),
  };

  if (body.isEnabled !== undefined) {
    input.isEnabled = parseEnabled(body.isEnabled);
  }

  return input;
}

export function parseUpdateHomeSectionInput(body) {
  requireObject(body, "Request body");

  const input = {};

  if (body.name !== undefined) {
    input.name = parseName(body.name);
  }

  if (body.content !== undefined) {
    input.content = parseContent(body.content);
  }

  if (body.isEnabled !== undefined) {
    input.isEnabled = parseEnabled(body.isEnabled);
  }

  if (Object.keys(input).length === 0) {
    throw new HomeSectionValidationError(
      "Provide at least one field to update.",
    );
  }

  return input;
}

export function parseHomeSectionReorderInput(body) {
  requireObject(body, "Request body");

  if (!Array.isArray(body.sectionIds) || body.sectionIds.length === 0) {
    throw new HomeSectionValidationError(
      "sectionIds must be a non-empty array.",
    );
  }

  const sectionIds = body.sectionIds.map((sectionId) =>
    parseHomeSectionId(sectionId),
  );

  const uniqueIds = new Set(sectionIds);

  if (uniqueIds.size !== sectionIds.length) {
    throw new HomeSectionValidationError(
      "sectionIds cannot contain duplicate section IDs.",
    );
  }

  return {
    sectionIds,
  };
}
