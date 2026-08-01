import apiClient from "./apiClient.js";

export async function fetchPublicCategories({ signal } = {}) {
  const response = await apiClient.get("/catalog/categories", {
    signal,
  });

  return response.data;
}

export async function fetchPublicProducts(params, { signal } = {}) {
  const response = await apiClient.get("/catalog/products", {
    params,
    signal,
  });

  return response.data;
}

export async function fetchPublicProductBySlug(slug, { signal } = {}) {
  const encodedSlug = encodeURIComponent(slug);

  const response = await apiClient.get(`/catalog/products/${encodedSlug}`, {
    signal,
  });

  return response.data;
}
