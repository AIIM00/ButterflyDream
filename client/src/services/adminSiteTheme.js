const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

export class AdminSiteThemeError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = "AdminSiteThemeError";
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
    throw new AdminSiteThemeError(
      body?.message || "The website theme request could not be completed.",
      {
        status: response.status,
      },
    );
  }

  return body;
}

export async function fetchAdminSiteTheme({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/admin/site/theme`, {
    method: "GET",
    credentials: "include",
    signal,
  });

  const body = await parseApiResponse(response);

  return body.theme;
}

export async function updateAdminSiteTheme(input, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/admin/site/theme`, {
    method: "PATCH",

    credentials: "include",
    signal,

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(input),
  });

  const body = await parseApiResponse(response);

  return body.theme;
}
