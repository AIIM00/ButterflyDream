import { emitSiteDraftChanged } from "../utils/siteDraftEvents.js";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

export class AdminSiteContentError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = "AdminSiteContentError";
    this.status = options.status ?? null;
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
    throw new AdminSiteContentError(
      body?.message || "The website content request could not be completed.",
      {
        status: response.status,
      },
    );
  }
  emitSiteDraftChanged();
  return body;
}

export async function fetchAdminHomeSections({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/admin/site/sections`, {
    method: "GET",
    credentials: "include",
    signal,
  });

  const body = await parseApiResponse(response);

  return Array.isArray(body.sections) ? body.sections : [];
}

export async function createAdminHomeSection(input, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/admin/site/sections`, {
    method: "POST",

    credentials: "include",
    signal,

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(input),
  });

  const body = await parseApiResponse(response);
  emitSiteDraftChanged();
  return body.section;
}

export async function updateAdminHomeSection(
  sectionId,
  input,
  { signal } = {},
) {
  const response = await fetch(
    `${API_BASE_URL}/admin/site/sections/${encodeURIComponent(sectionId)}`,
    {
      method: "PATCH",

      credentials: "include",
      signal,

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(input),
    },
  );

  const body = await parseApiResponse(response);
  emitSiteDraftChanged();
  return body.section;
}

export async function reorderAdminHomeSections(sectionIds, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/admin/site/sections/reorder`, {
    method: "PATCH",

    credentials: "include",
    signal,

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      sectionIds,
    }),
  });

  const body = await parseApiResponse(response);
  emitSiteDraftChanged();
  return Array.isArray(body.sections) ? body.sections : [];
}

export async function deleteAdminHomeSection(sectionId, { signal } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/admin/site/sections/${encodeURIComponent(sectionId)}`,
    {
      method: "DELETE",

      credentials: "include",
      signal,
    },
  );
  emitSiteDraftChanged();
  return parseApiResponse(response);
}
