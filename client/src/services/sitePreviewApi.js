const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

export async function fetchSiteDraftPreview(previewToken, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/site/preview`, {
    method: "GET",

    signal,

    headers: {
      "X-Site-Preview-Token": previewToken,
    },
  });

  let body;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(body?.message || "The draft preview could not be loaded.");
  }

  return body;
}
