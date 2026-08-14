const API_URL = import.meta.env.VITE_API_URL;

async function request(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,

    credentials: "include",

    signal,

    headers: {
      Accept: "application/json",

      ...(body !== undefined
        ? {
            "Content-Type": "application/json",
          }
        : {}),
    },

    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(
      payload?.message || "Unable to complete the request.",
    );

    error.status = response.status;

    error.response = {
      status: response.status,

      data: payload,
    };

    throw error;
  }

  return payload ?? {};
}

export async function fetchAdminPopupEvents({
  page = 1,
  limit = 50,
  status,
  signal,
} = {}) {
  const parameters = new URLSearchParams({
    page: String(page),

    limit: String(limit),
  });

  if (status) {
    parameters.set("status", status);
  }

  const response = await request(`/admin/popups?${parameters.toString()}`, {
    signal,
  });

  return {
    popupEvents: response.popupEvents ?? [],

    pagination: response.pagination ?? null,
  };
}

export async function fetchAdminPopupEvent(popupEventId, { signal } = {}) {
  const response = await request(
    `/admin/popups/${encodeURIComponent(popupEventId)}`,
    {
      signal,
    },
  );

  return response.popupEvent;
}

export async function createAdminPopupEvent(input) {
  const response = await request("/admin/popups", {
    method: "POST",

    body: input,
  });

  return response.popupEvent;
}

export async function updateAdminPopupEvent(popupEventId, input) {
  const response = await request(
    `/admin/popups/${encodeURIComponent(popupEventId)}`,
    {
      method: "PATCH",

      body: input,
    },
  );

  return response.popupEvent;
}

export async function updateAdminPopupEventStatus(popupEventId, status) {
  const response = await request(
    `/admin/popups/${encodeURIComponent(popupEventId)}/status`,
    {
      method: "PATCH",

      body: {
        status,
      },
    },
  );

  return response.popupEvent;
}

export async function reorderAdminPopupEvents(ids) {
  const response = await request("/admin/popups/reorder", {
    method: "POST",

    body: {
      ids,
    },
  });

  return response.popupEvents ?? [];
}

export async function deleteAdminPopupComment(commentId) {
  return request(`/admin/popups/comments/${encodeURIComponent(commentId)}`, {
    method: "DELETE",
  });
}
