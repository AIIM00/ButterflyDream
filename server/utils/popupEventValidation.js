const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DEFAULT_POST_LIMIT = 10;
const MAX_POST_LIMIT = 20;

const DEFAULT_COMMENT_LIMIT = 20;
const MAX_COMMENT_LIMIT = 50;

const MAX_PAGE = 100000;
const MAX_INTERACTION_POSTS = 50;

export class PopupEventValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "PopupEventValidationError";
    this.statusCode = 400;
  }
}

function parsePositiveInteger(value, { fieldName, defaultValue, maximum }) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const numericValue = Number(value);

  if (
    !Number.isInteger(numericValue) ||
    numericValue < 1 ||
    numericValue > maximum
  ) {
    throw new PopupEventValidationError(
      `${fieldName} must be an integer between 1 and ${maximum}.`,
    );
  }

  return numericValue;
}

export function parsePopupEventId(value) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized || !UUID_PATTERN.test(normalized)) {
    throw new PopupEventValidationError("Popup event ID is invalid.");
  }

  return normalized;
}

export function parsePopupCommentId(value) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized || !UUID_PATTERN.test(normalized)) {
    throw new PopupEventValidationError("Comment ID is invalid.");
  }

  return normalized;
}

export function parsePublicPopupQuery(query) {
  return {
    page: parsePositiveInteger(query.page, {
      fieldName: "Page",
      defaultValue: 1,
      maximum: MAX_PAGE,
    }),

    limit: parsePositiveInteger(query.limit, {
      fieldName: "Limit",
      defaultValue: DEFAULT_POST_LIMIT,
      maximum: MAX_POST_LIMIT,
    }),
  };
}

export function parsePopupCommentsQuery(query) {
  return {
    page: parsePositiveInteger(query.page, {
      fieldName: "Page",
      defaultValue: 1,
      maximum: MAX_PAGE,
    }),

    limit: parsePositiveInteger(query.limit, {
      fieldName: "Limit",
      defaultValue: DEFAULT_COMMENT_LIMIT,
      maximum: MAX_COMMENT_LIMIT,
    }),
  };
}

export function parsePopupCommentBody(body) {
  const comment = typeof body?.comment === "string" ? body.comment.trim() : "";

  if (!comment) {
    throw new PopupEventValidationError("Comment cannot be empty.");
  }

  if (comment.length > 1000) {
    throw new PopupEventValidationError(
      "Comment cannot exceed 1000 characters.",
    );
  }

  return {
    comment,
  };
}

export function parsePopupInteractionIds(query) {
  const raw = typeof query.ids === "string" ? query.ids : "";

  if (!raw.trim()) {
    return [];
  }

  const ids = [
    ...new Set(
      raw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];

  if (ids.length > MAX_INTERACTION_POSTS) {
    throw new PopupEventValidationError(
      `A maximum of ${MAX_INTERACTION_POSTS} popup IDs can be requested at once.`,
    );
  }

  for (const id of ids) {
    if (!UUID_PATTERN.test(id)) {
      throw new PopupEventValidationError(
        "One or more popup event IDs are invalid.",
      );
    }
  }

  return ids;
}
