import apiClient from "./apiClient.js";

export async function fetchAdminDashboard(
  { period = "30d" } = {},
  { signal } = {},
) {
  const response = await apiClient.get("/admin/dashboard", {
    signal,
    params: {
      period,
    },
  });

  return response.data;
}

export async function fetchAdminStoreSettings({ signal } = {}) {
  const response = await apiClient.get("/admin/settings", {
    signal,
  });

  return response.data;
}

export async function updateAdminStoreSettings(settingsData) {
  const response = await apiClient.patch("/admin/settings", settingsData);

  return response.data;
}
