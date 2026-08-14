import {
  SITE_THEME_COLOR_DEFAULTS,
  SITE_THEME_FONT_OPTIONS,
} from "../config/siteThemeConfig.js";

const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/i;

const ALLOWED_COLOR_KEYS = new Set(Object.keys(SITE_THEME_COLOR_DEFAULTS));

const ALLOWED_DISPLAY_FONTS = new Set(SITE_THEME_FONT_OPTIONS.display);

const ALLOWED_BODY_FONTS = new Set(SITE_THEME_FONT_OPTIONS.body);

export class AdminSiteThemeValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "AdminSiteThemeValidationError";
    this.statusCode = 400;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

function parseColors(value) {
  if (!isPlainObject(value)) {
    throw new AdminSiteThemeValidationError("colors must be an object.");
  }

  const entries = Object.entries(value);

  if (entries.length === 0) {
    throw new AdminSiteThemeValidationError(
      "At least one color must be provided.",
    );
  }

  const colors = {};

  for (const [key, color] of entries) {
    if (!ALLOWED_COLOR_KEYS.has(key)) {
      throw new AdminSiteThemeValidationError(`Unknown theme color: ${key}.`);
    }

    if (typeof color !== "string" || !HEX_COLOR_PATTERN.test(color.trim())) {
      throw new AdminSiteThemeValidationError(
        `${key} must be a valid 6-digit HEX color such as #163B2B.`,
      );
    }

    colors[key] = color.trim().toUpperCase();
  }

  return colors;
}

function parseFonts(value) {
  if (!isPlainObject(value)) {
    throw new AdminSiteThemeValidationError("fonts must be an object.");
  }

  const fonts = {};

  if (hasOwn(value, "display")) {
    if (
      typeof value.display !== "string" ||
      !ALLOWED_DISPLAY_FONTS.has(value.display)
    ) {
      throw new AdminSiteThemeValidationError("Invalid display font.");
    }

    fonts.display = value.display;
  }

  if (hasOwn(value, "body")) {
    if (typeof value.body !== "string" || !ALLOWED_BODY_FONTS.has(value.body)) {
      throw new AdminSiteThemeValidationError("Invalid body font.");
    }

    fonts.body = value.body;
  }

  const unknownKeys = Object.keys(value).filter(
    (key) => key !== "display" && key !== "body",
  );

  if (unknownKeys.length > 0) {
    throw new AdminSiteThemeValidationError(
      `Unknown font setting: ${unknownKeys[0]}.`,
    );
  }

  if (Object.keys(fonts).length === 0) {
    throw new AdminSiteThemeValidationError(
      "At least one font must be provided.",
    );
  }

  return fonts;
}

export function parseAdminSiteThemeInput(body) {
  if (!isPlainObject(body)) {
    throw new AdminSiteThemeValidationError(
      "A valid request body is required.",
    );
  }

  const input = {};

  if (hasOwn(body, "colors")) {
    input.colors = parseColors(body.colors);
  }

  if (hasOwn(body, "fonts")) {
    input.fonts = parseFonts(body.fonts);
  }

  const unknownTopLevelKeys = Object.keys(body).filter(
    (key) => key !== "colors" && key !== "fonts",
  );

  if (unknownTopLevelKeys.length > 0) {
    throw new AdminSiteThemeValidationError(
      `Unknown theme setting: ${unknownTopLevelKeys[0]}.`,
    );
  }

  if (Object.keys(input).length === 0) {
    throw new AdminSiteThemeValidationError(
      "At least one theme setting must be provided.",
    );
  }

  return input;
}
