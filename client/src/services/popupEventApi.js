import apiClient from "./apiClient.js";

/*
 * ======================================================
 * PUBLIC
 * ======================================================
 */

export async function fetchPopupEvents(
  { page = 1, limit = 10 } = {},
  { signal } = {},
) {
  const response = await apiClient.get("/popups", {
    signal,

    params: {
      page,
      limit,
    },
  });

  return response.data;
}

export async function fetchPopupComments(
  popupEventId,
  { page = 1, limit = 20 } = {},
  { signal } = {},
) {
  const response = await apiClient.get(
    `/popups/${encodeURIComponent(popupEventId)}/comments`,
    {
      signal,

      params: {
        page,
        limit,
      },
    },
  );

  return response.data;
}

/*
 * ======================================================
 * CUSTOMER INTERACTIONS
 * ======================================================
 */

export async function fetchCustomerPopupInteractions(
  popupEventIds,
  { signal } = {},
) {
  if (!Array.isArray(popupEventIds) || popupEventIds.length === 0) {
    return {
      interactions: {},
    };
  }

  const response = await apiClient.get("/customer/popups/interactions", {
    signal,

    params: {
      ids: popupEventIds.join(","),
    },
  });

  return response.data;
}

export async function likePopupEvent(popupEventId) {
  const response = await apiClient.post(
    `/customer/popups/${encodeURIComponent(popupEventId)}/like`,
  );

  return response.data;
}

export async function unlikePopupEvent(popupEventId) {
  const response = await apiClient.delete(
    `/customer/popups/${encodeURIComponent(popupEventId)}/like`,
  );

  return response.data;
}

export async function confirmPopupAttendance(popupEventId) {
  const response = await apiClient.post(
    `/customer/popups/${encodeURIComponent(popupEventId)}/attendance`,
  );

  return response.data;
}

export async function removePopupAttendance(popupEventId) {
  const response = await apiClient.delete(
    `/customer/popups/${encodeURIComponent(popupEventId)}/attendance`,
  );

  return response.data;
}

export async function createPopupComment(popupEventId, comment) {
  const response = await apiClient.post(
    `/customer/popups/${encodeURIComponent(popupEventId)}/comments`,
    {
      comment,
    },
  );

  return response.data;
}

export async function deletePopupComment(commentId) {
  const response = await apiClient.delete(
    `/customer/popups/comments/${encodeURIComponent(commentId)}`,
  );

  return response.data;
}
