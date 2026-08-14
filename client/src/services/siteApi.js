import apiClient from "./apiClient.js";

export async function fetchPublicSiteHome({ signal } = {}) {
  const response = await apiClient.get("/site/home", {
    signal,
  });

  return response.data;
}
