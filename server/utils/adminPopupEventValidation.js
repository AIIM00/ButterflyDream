const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VALID_STATUSES = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export class AdminPopupEventValidationError extends Error {
  constructor(message) {
    super(message);

    this.name = "AdminPopupEventValidationError";

    this.statusCode = 400;
  }
}

function parseId(value, label) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!UUID_PATTERN.test(normalized)) {
    throw new AdminPopupEventValidationError(`${label} is invalid.`);
  }

  return normalized;
}

function parseOptionalString(value, { label, maxLength }) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new AdminPopupEventValidationError(`${label} must be text.`);
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new AdminPopupEventValidationError(
      `${label} cannot exceed ${maxLength} characters.`,
    );
  }

  return normalized || null;
}

function parseRequiredString(value, { label, maxLength }) {
  const normalized = parseOptionalString(value, {
    label,
    maxLength,
  });

  if (!normalized) {
    throw new AdminPopupEventValidationError(`${label} is required.`);
  }

  return normalized;
}

function parseImages(value) {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new AdminPopupEventValidationError("Images must be an array.");
  }

  if (value.length > 20) {
    throw new AdminPopupEventValidationError(
      "A popup post can contain a maximum of 20 images.",
    );
  }

  const seen = new Set();

  return value.map((image, index) => {
    const mediaAssetId = parseId(
      image?.mediaAssetId,
      `Image ${index + 1} media asset ID`,
    );

    if (seen.has(mediaAssetId)) {
      throw new AdminPopupEventValidationError(
        "The same Media Library image cannot be added twice.",
      );
    }

    seen.add(mediaAssetId);

    return {
      mediaAssetId,

      altText: parseOptionalString(image?.altText, {
        label: `Image ${index + 1} alt text`,

        maxLength: 300,
      }),

      position: index,
    };
  });
}

export function parsePopupEventId(value) {
  return parseId(value, "Popup event ID");
}

export function parsePopupCommentId(value) {
  return parseId(value, "Comment ID");
}

export function parseCreatePopupEventInput(body) {
  return {
    title: parseRequiredString(body?.title, {
      label: "Title",
      maxLength: 160,
    }),

    location: parseOptionalString(body?.location, {
      label: "Location",
      maxLength: 180,
    }),

    dateLabel: parseOptionalString(body?.dateLabel, {
      label: "Date label",
      maxLength: 80,
    }),

    caption: parseRequiredString(body?.caption, {
      label: "Caption",
      maxLength: 5000,
    }),

    commentsEnabled:
      body?.commentsEnabled === undefined
        ? true
        : Boolean(body.commentsEnabled),

    images: parseImages(body?.images ?? []),
  };
}

export function parseUpdatePopupEventInput(body) {
  const input = {};

  if (body?.title !== undefined) {
    input.title = parseRequiredString(body.title, {
      label: "Title",
      maxLength: 160,
    });
  }

  if (body?.location !== undefined) {
    input.location = parseOptionalString(body.location, {
      label: "Location",
      maxLength: 180,
    });
  }

  if (body?.dateLabel !== undefined) {
    input.dateLabel = parseOptionalString(body.dateLabel, {
      label: "Date label",
      maxLength: 80,
    });
  }

  if (body?.caption !== undefined) {
    input.caption = parseRequiredString(body.caption, {
      label: "Caption",
      maxLength: 5000,
    });
  }

  if (body?.commentsEnabled !== undefined) {
    input.commentsEnabled = Boolean(body.commentsEnabled);
  }

  if (body?.images !== undefined) {
    input.images = parseImages(body.images);
  }

  if (Object.keys(input).length === 0) {
    throw new AdminPopupEventValidationError(
      "No popup event changes were provided.",
    );
  }

  return input;
}

export function parsePopupEventStatusInput(body) {
  const status =
    typeof body?.status === "string" ? body.status.trim().toUpperCase() : "";

  if (!VALID_STATUSES.has(status)) {
    throw new AdminPopupEventValidationError(
      "Popup status must be DRAFT, PUBLISHED, or ARCHIVED.",
    );
  }

  return {
    status,
  };
}

export function parsePopupEventListQuery(query) {
  const page = Number(query?.page ?? 1);

  const limit = Number(query?.limit ?? 20);

  if (!Number.isInteger(page) || page < 1) {
    throw new AdminPopupEventValidationError(
      "Page must be a positive integer.",
    );
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new AdminPopupEventValidationError("Limit must be between 1 and 50.");
  }

  const rawStatus =
    typeof query?.status === "string" ? query.status.trim().toUpperCase() : "";

  if (rawStatus && !VALID_STATUSES.has(rawStatus)) {
    throw new AdminPopupEventValidationError("Invalid popup event status.");
  }

  return {
    page,
    limit,

    status: rawStatus || null,
  };
}

export function parsePopupEventReorderInput(body) {
  if (!Array.isArray(body?.ids)) {
    throw new AdminPopupEventValidationError(
      "Popup event IDs must be an array.",
    );
  }

  const ids = body.ids.map((id) => parsePopupEventId(id));

  if (new Set(ids).size !== ids.length) {
    throw new AdminPopupEventValidationError("Popup event IDs must be unique.");
  }

  return {
    ids,
  };
}
