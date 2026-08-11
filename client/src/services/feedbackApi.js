import apiClient from "./apiClient.js";

export async function fetchFeedbacks(page = 1, { signal } = {}) {
  const response = await apiClient.get("/feedback", {
    params: {
      page,
    },
    signal,
  });

  return response.data;
}

export async function fetchMyFeedback({ signal } = {}) {
  const response = await apiClient.get("/feedback/me", {
    signal,
  });

  return response.data;
}

export async function createFeedback(payload) {
  const response = await apiClient.post("/feedback", payload);

  return response.data;
}

export async function updateMyFeedback(payload) {
  const response = await apiClient.patch("/feedback/me", payload);

  return response.data;
}
