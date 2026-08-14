const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

export class AdminSitePublicationError extends Error {
  constructor(message, { status = null } = {}) {
    super(message);

    this.name = "AdminSitePublicationError";

    this.status = status;
  }
}

async function parseApiResponse(response) {
  let body;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new AdminSitePublicationError(
      body?.message ||
        "The website publication request could not be completed.",
      {
        status: response.status,
      },
    );
  }

  return body;
}

export async function fetchSitePublicationStatus({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/admin/site/publication`, {
    credentials: "include",

    signal,
  });

  const body = await parseApiResponse(response);

  return body.publication;
}

export async function publishSiteDraft({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/admin/site/publish`, {
    method: "POST",

    credentials: "include",

    signal,
  });

  const body = await parseApiResponse(response);

  return body.publication;
}

export async function createSiteDraftPreview({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/admin/site/preview-token`, {
    method: "POST",

    credentials: "include",

    signal,
  });

  const body = await parseApiResponse(response);

  return body.preview;
}
