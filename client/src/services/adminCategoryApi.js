import apiClient from "./apiClient.js";

export async function fetchAdminCategories({ signal } = {}) {
  const response = await apiClient.get("/admin/categories", {
    signal,
  });

  return response.data;
}

export async function createAdminCategory(categoryData) {
  const response = await apiClient.post("/admin/categories", categoryData);

  return response.data;
}

export async function updateAdminCategory(categoryId, categoryData) {
  const response = await apiClient.patch(
    `/admin/categories/${encodeURIComponent(categoryId)}`,
    categoryData,
  );

  return response.data;
}

export async function updateAdminCategoryStatus(categoryId, statusData) {
  const response = await apiClient.patch(
    `/admin/categories/${encodeURIComponent(categoryId)}/status`,
    statusData,
  );

  return response.data;
}

export async function reorderAdminCategories(categoryIds) {
  const response = await apiClient.patch("/admin/categories/reorder", {
    categoryIds,
  });

  return response.data;
}
